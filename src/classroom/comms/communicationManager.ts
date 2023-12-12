import { MessageBus } from "@dcl/sdk/message-bus"
import { ClassroomManager } from "../classroomManager"
import { DebugPanel } from "../ui/debugPanel"
import { Color4 } from "@dcl/sdk/math"
import { IClassroomChannel } from "./IClassroomChannel"
import { UserDataHelper } from "../userDataHelper"
import { ClassContentPacket, ClassPacket, Classroom, StudentCommInfo, ContentUnitPacket, DataPacket, StudentDataPacket, ClassContent, ClassroomSharePacket } from "../types/classroomTypes"
import { ContentUnitManager } from "../../contentUnits/contentUnitManager"
import { Transform, engine } from "@dcl/sdk/ecs"
import { MediaContentType } from "../../classroomContent/enums";
import { StudentClassController } from "../classroomControllers/studentClassController"

/**
 * Manages all communication between teachers and students.
 */
export class CommunicationManager {
    static readonly CLASS_EMIT_PERIOD: number = 10

    static messageBus: MessageBus
    static channel: IClassroomChannel
    static elapsed: number = 0

    /**
    * Initialises the CommunicationManager.
    *
    * @param _channel the classroom channel used for communication.
    * @returns false.
    */
    static Initialise(_channel: IClassroomChannel): void {
        CommunicationManager.channel = _channel

        if (CommunicationManager.messageBus === undefined || CommunicationManager.messageBus === null) {
            CommunicationManager.messageBus = new MessageBus()

            CommunicationManager.messageBus.on('start_class', CommunicationManager.OnStartClass)
            CommunicationManager.messageBus.on('end_class', CommunicationManager.OnEndClass)
            CommunicationManager.messageBus.on('join_class', CommunicationManager.OnJoinClass)
            CommunicationManager.messageBus.on('exit_class', CommunicationManager.OnExitClass)
            CommunicationManager.messageBus.on('share_classroom_config', CommunicationManager.OnShareClassroomConfig)
            CommunicationManager.messageBus.on('display_image', CommunicationManager.OnImageDisplay)
            CommunicationManager.messageBus.on('play_video', CommunicationManager.OnVideoPlay)
            CommunicationManager.messageBus.on('pause_video', CommunicationManager.OnVideoPause)
            CommunicationManager.messageBus.on('resume_video', CommunicationManager.OnVideoResume)
            CommunicationManager.messageBus.on('set_video_volume', CommunicationManager.OnVideoVolume)
            CommunicationManager.messageBus.on('play_model', CommunicationManager.OnModelPlay)
            CommunicationManager.messageBus.on('pause_model', CommunicationManager.OnModelPause)
            CommunicationManager.messageBus.on('resume_model', CommunicationManager.OnModelResume)
            CommunicationManager.messageBus.on('deactivate_screens', CommunicationManager.OnScreenDeactivation)
            CommunicationManager.messageBus.on('deactivate_models', CommunicationManager.OnModelDeactivation)
            CommunicationManager.messageBus.on('content_unit_start', CommunicationManager.OnContentUnitStart)
            CommunicationManager.messageBus.on('content_unit_end', CommunicationManager.OnContentUnitEnd)
            CommunicationManager.messageBus.on('content_unit_teacher_send', CommunicationManager.OnContentUnitTeacherSend)
            CommunicationManager.messageBus.on('content_unit_student_send', CommunicationManager.OnContentUnitStudentSend)

            CommunicationManager.messageBus.on('log', (info: any) => {
                const logColor = info.studentEvent ? (info.highPriority ? Color4.Blue() : Color4.Green()) : (info.highPriority ? Color4.Red() : Color4.Yellow())
                DebugPanel.LogClassEvent(info.message, logColor, info.classroomGuid, info.studentEvent, info.global)
            })

            // teacher emits a class start every 10 seconds if they've started a class
            engine.addSystem((dt: number) => {
                if (!ClassroomManager.classController || !ClassroomManager.classController.isTeacher() || !ClassroomManager.classController.inSession || !ClassroomManager.activeClassroom) return

                CommunicationManager.elapsed += dt
                if (CommunicationManager.elapsed > CommunicationManager.CLASS_EMIT_PERIOD) {
                    CommunicationManager.elapsed = 0

                    CommunicationManager.channel.emitClassStart({
                        id: ClassroomManager.activeClassroom.guid, //use the class guid for students instead of the active content id
                        name: ClassroomManager.activeContent.name,
                        description: ClassroomManager.activeContent.description
                    })
                }
            })
        }
    }

    ////////////// SEND //////////////

    /**
    * Emits class start to students.
    *
    * @param _info info object that holds the id, name and description.
    */
    static EmitClassStart(_info: ClassPacket): void {
        CommunicationManager.channel.emitClassStart(_info)
        CommunicationManager.EmitLog("You started teaching class " + _info.name, _info.id, false, true)
        CommunicationManager.EmitLog(UserDataHelper.GetDisplayName() + " started teaching " + _info.name, _info.id, true, true, true)
    }

    /**
    * Emits class end to students.
    *
    * @param _info info object that holds the id, name and description.
    */
    static EmitClassEnd(_info: ClassPacket): void {
        CommunicationManager.channel.emitClassEnd(_info)
        CommunicationManager.EmitLog("You ended class " + _info.name, _info.id, false, true)
        CommunicationManager.EmitLog(UserDataHelper.GetDisplayName() + " stopped teaching " + _info.name, _info.id, true, true, true)
    }

    /**
    * Emits class join to the teacher.
    *
    * @param _info student info.
    */
    static EmitClassJoin(_info: StudentCommInfo): void {
        CommunicationManager.channel.emitClassJoin(_info)
    }

    /**
    * Emits class exit to the teacher.
    *
    * @param _info student info.
    */
    static EmitClassExit(_info: StudentCommInfo): void {
        CommunicationManager.channel.emitClassExit(_info)
        CommunicationManager.EmitLog(_info.studentName + " left class " + _info.name, _info.id, true, true)
    }

    /**
    * Emits the classroom config to the student requesting to join.
    *
    * @param _config classroom config.
    * @param _content classroom content.
    * @param _activeContentType the type of content that's currently active.
    */
    static EmitClassroomConfig(_config: Classroom, _content: ClassContent, _activeContentType: MediaContentType): void {
        CommunicationManager.channel.emitClassroomConfig({
            config: _config,
            content: _content,
            activeContentType: _activeContentType
        })

        if (ClassroomManager.activeClassroom && ContentUnitManager.activeUnit) {
            CommunicationManager.EmitContentUnitStart({
                id: ClassroomManager.activeClassroom.guid,
                name: ClassroomManager.activeClassroom.className,
                description: ClassroomManager.activeClassroom.classDescription,
                unit: {
                    key: ContentUnitManager.activeUnitKey,
                    data: ContentUnitManager.activeUnitData
                }
            })
        }
        CommunicationManager.EmitLog(_config.teacherName + " is sharing classroom config for class " + _config.className, _config.guid, false, false)
    }

    /**
    * Emits image display to the students.
    *
    * @param _info content info.
    */
    static EmitImageDisplay(_info: ClassContentPacket): void {
        CommunicationManager.channel.emitImageDisplay(_info)
        CommunicationManager.EmitLog("You displayed image: " + _info.image?.src, _info.id, false, false)
        CommunicationManager.EmitLog("Teacher displayed image: " + _info.image?.src, _info.id, true, false)
    }

    /**
    * Emits video display to the students.
    *
    * @param _info content info.
    */
    static EmitVideoPlay(_info: ClassContentPacket): void {
        CommunicationManager.channel.emitVideoPlay(_info)
        CommunicationManager.EmitLog("You displayed video: " + _info.video?.src, _info.id, false, false)
        CommunicationManager.EmitLog("Teacher displayed video: " + _info.video?.src, _info.id, true, false)
    }

    /**
    * Emits video pause to the students.
    *
    * @param _info classroom info.
    */
    static EmitVideoPause(_info: ClassPacket): void {
        CommunicationManager.channel.emitVideoPause(_info)
        CommunicationManager.EmitLog("You paused the video", _info.id, false, false)
        CommunicationManager.EmitLog("Teacher paused video", _info.id, true, false)
    }

    /**
    * Emits video resume to the students.
    *
    * @param _info classroom info.
    */
    static EmitVideoResume(_info: ClassPacket): void {
        CommunicationManager.channel.emitVideoResume(_info)
        CommunicationManager.EmitLog("You resumed the video", _info.id, false, false)
        CommunicationManager.EmitLog("Teacher resumed video", _info.id, true, false)
    }

    /**
    * Emits a video volume to the students. The volume is either 0 or 1.
    *
    * @param _info classroom info and the target volume.
    */
    static EmitVideoVolume(_info: ClassPacket & { volume: number }): void {
        CommunicationManager.channel.emitVideoVolume(_info)
        const muteStr = _info.volume == 0 ? "muted" : "unmuted"
        CommunicationManager.EmitLog("You " + muteStr + " the video", _info.id, false, false)
        CommunicationManager.EmitLog("Teacher " + muteStr + " video", _info.id, true, false)
    }

    /**
    * Emits model play/display to the students.
    *
    * @param _info content info.
    */
    static EmitModelPlay(_info: ClassContentPacket): void {
        CommunicationManager.channel.emitModelPlay(_info)
        CommunicationManager.EmitLog("You displayed model: " + _info.model?.src, _info.id, false, false)
        CommunicationManager.EmitLog("Teacher displayed model: " + _info.model?.src, _info.id, true, false)
    }

    /**
    * Emits model pause to the students.
    *
    * @param _info classroom info.
    */
    static EmitModelPause(_info: ClassPacket): void {
        CommunicationManager.channel.emitModelPause(_info)
        CommunicationManager.EmitLog("You paused the model", _info.id, false, false)
        CommunicationManager.EmitLog("Teacher paused model", _info.id, true, false)
    }

    /**
    * Emits model resume to the students.
    *
    * @param _info classroom info.
    */
    static EmitModelResume(_info: ClassPacket): void {
        CommunicationManager.channel.emitModelResume(_info)
        CommunicationManager.EmitLog("You resumed the model", _info.id, false, false)
        CommunicationManager.EmitLog("Teacher resumed model", _info.id, true, false)
    }

    /**
    * Emits screen deactivation to the students. Called when the teacher turns off the podium or ends a class.
    *
    * @param _info classroom info.
    */
    static EmitScreenDeactivation(_info: ClassPacket): void {
        CommunicationManager.channel.emitScreenDeactivation(_info)
        CommunicationManager.EmitLog("You deactivated the screen", _info.id, false, false)
        CommunicationManager.EmitLog("Teacher deactivated screen", _info.id, true, false)
    }

    /**
    * Emits model deactivation to the students.
    *
    * @param _info classroom info.
    */
    static EmitModelDeactivation(_info: ClassPacket): void {
        CommunicationManager.channel.emitModelDeactivation(_info)
        CommunicationManager.EmitLog("You deactivated the model", _info.id, false, false)
        CommunicationManager.EmitLog("Teacher deactivated model", _info.id, true, false)
    }

    /**
    * Emits a content unit start to the students.
    *
    * @param _info content unit info.
    */
    static EmitContentUnitStart(_info: ContentUnitPacket): void {
        CommunicationManager.channel.emitContentUnitStart(_info)
        CommunicationManager.EmitLog("You started a content unit: " + _info.unit.key, _info.id, false, false)
        CommunicationManager.EmitLog("Teacher started a content unit: " + _info.unit.key, _info.id, true, false)
    }

    /**
    * Emits a content unit end to the students.
    *
    * @param _info content unit info.
    */
    static EmitContentUnitEnd(_info: ClassPacket): void {
        CommunicationManager.channel.emitContentUnitEnd(_info)
        CommunicationManager.EmitLog("You ended the content unit", _info.id, false, false)
        CommunicationManager.EmitLog("Teacher ended content unit", _info.id, true, false)
    }

    /**
    * Emits a content unit update to the students. Called by the teacher to send content unit update data.
    *
    * @param _info data packet that can hold any type of data.
    */
    static EmitContentUnitTeacherSend(_info: DataPacket): void {
        CommunicationManager.channel.emitContentUnitTeacherSend(_info)
    }

    /**
    * Emits a content unit update to the teacher. Called by the students to send content unit update data.
    *
    * @param _info data packet that can hold any type of data. It also holds the student info.
    */
    static EmitContentUnitStudentSend(_info: StudentDataPacket): void {
        CommunicationManager.channel.emitContentUnitStudentSend(_info)
    }

    /**
    * Emits a log event for the debug panel
    *
    * @param _message the message we want to display in the debug panel.
    * @param _classroomGuid the classroom guid.
    * @param _studentEvent boolean that indicates if it's a teacher or student event.
    * @param _highPriority boolean that indicates if it's a high priority event (for the purposes of loggin in different colors).
    * @param _global boolean that indicates if it's a global event. If global, it logs the event for all students.
    */
    static EmitLog(_message: string, _classroomGuid: string, _studentEvent: boolean, _highPriority: boolean, _global: boolean = false): void {
        CommunicationManager.messageBus.emit('log', {
            message: _message,
            classroomGuid: _classroomGuid,
            studentEvent: _studentEvent,
            highPriority: _highPriority,
            global: _global
        })
    }

    ////////////// RECEIVE //////////////

    /**
    * Receives a class start emit from the teacher and stores that class in a list for all students.
    * When the student steps into a classroom volume, the list is used to request to join.
    *
    * @param _info classroom info.
    */
    static OnStartClass(_info: ClassPacket): void {
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent()) {

            let studentClassController = ClassroomManager.classController as StudentClassController

            let classFound: boolean = false
            for (let i = 0; i < studentClassController.sceneClassList.length; i++) {
                if (studentClassController.sceneClassList[i].id == _info.id) {
                    studentClassController.sceneClassList[i].name = _info.name
                    studentClassController.sceneClassList[i].description = _info.description
                    classFound = true
                    break
                }
            }

            if (!classFound) {
                studentClassController.sceneClassList.push({
                    id: _info.id,
                    name: _info.name,
                    description: _info.description,
                })
            }
        }
    }

    /**
    * Receives a class end emit from the teacher and kicks students out if they were in that class.
    * In addition, all media is turned off.
    *
    * @param _info classroom info.
    */
    static OnEndClass(_info: ClassPacket): void {
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent()) {
            if (ClassroomManager.screenManager.poweredOn) {
                ClassroomManager.screenManager.powerToggle()
            }

            if (ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id) {
                ClassroomManager.classController.inSession = false
                ClassroomManager.activeClassroom = null
            }

            let studentClassController = ClassroomManager.classController as StudentClassController

            for (let i = 0; i < studentClassController.sceneClassList.length; i++) {
                if (studentClassController.sceneClassList[i].id == _info.id) {
                    studentClassController.sceneClassList.splice(i, 1)
                    break
                }
            }
        }
    }

    /**
    * Receives a class join emit from a student. The teacher for that class will update their classroom and content info and emit those back to the student.
    *
    * @param _info student info.
    */
    static OnJoinClass(_info: StudentCommInfo) {
        if (ClassroomManager.classController && ClassroomManager.classController.isTeacher() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id) {
            (ClassroomManager.activeClassroom as Classroom).students.push({
                studentID: _info.studentID,
                studentName: _info.studentName
            })
            ClassroomManager.UpdateClassroom()
            CommunicationManager.EmitClassroomConfig(ClassroomManager.activeClassroom, ClassroomManager.activeContent, ClassroomManager.screenManager.currentContent?.getContent()?.getContentType())
            CommunicationManager.EmitLog(_info.studentName + " joined class " + ClassroomManager.activeClassroom.className, _info.id, false, true)
        }
    }

    /**
    * Receives a class exit emit from a student. The teacher for that class will remove them from the students list.
    *
    * @param _info student info.
    */
    static OnExitClass(_info: StudentCommInfo) {
        if (ClassroomManager.classController && ClassroomManager.classController.isTeacher() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id) {
            for (let i = 0; i < (ClassroomManager.activeClassroom as Classroom).students.length; i++) {
                if ((ClassroomManager.activeClassroom as Classroom).students[i].studentID == _info.studentID) {
                    (ClassroomManager.activeClassroom as Classroom).students.splice(i, 1)
                    CommunicationManager.EmitLog(_info.studentName + " left class " + ClassroomManager.activeClassroom.className, _info.id, false, true)
                    break
                }
            }
        }
    }

    /**
    * Receives a shareClassroomConfig emit from the teacher. The student uses the received info to set up their classroom with all the updated content.
    *
    * @param _info the full classroom and content info.
    */
    static OnShareClassroomConfig(_info: ClassroomSharePacket) {
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.requestingJoinClass && ClassroomManager.classController.classList[ClassroomManager.classController.selectedClassIndex].id == _info.config.guid) {
            ClassroomManager.requestingJoinClass = false
            ClassroomManager.activeClassroom = _info.config
            ClassroomManager.activeContent = _info.content
            ClassroomManager.SyncClassroom(_info.activeContentType)
            let originEntityTransform = Transform.getMutableOrNull(ClassroomManager.originEntity)
            if (originEntityTransform) {
                originEntityTransform.position = ClassroomManager.activeClassroom.origin
            }
            ClassroomManager.classController.inSession = true
            CommunicationManager.EmitLog(UserDataHelper.GetDisplayName() + " joined class " + _info.config.className, _info.config.guid, true, false)
        }
    }

    /**
    * Receives an image display emit from the teacher and displays the image for the student.
    *
    * @param _info content info.
    */
    static OnImageDisplay(_info: ClassContentPacket) {
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id && _info.image) {

            ClassroomManager.screenManager.imageContent?.stop()
            ClassroomManager.screenManager.videoContent?.stop()
            ClassroomManager.screenManager.currentContent = ClassroomManager.screenManager.imageContent
            for (let i = 0; i < ClassroomManager.screenManager.imageContent.content.length; i++) {
                if (ClassroomManager.screenManager.imageContent.content[i].configuration.src == _info.image.src) {
                    ClassroomManager.screenManager.imageContent.index = i
                    break
                }
            }

            if (!ClassroomManager.screenManager.poweredOn) {
                ClassroomManager.screenManager.powerToggle(true)
            }

            ClassroomManager.screenManager.unHideContent()
            ClassroomManager.screenManager.playContent()
        }
    }

    /**
    * Receives a video play emit from the teacher and displays/plays the video for the student.
    *
    * @param _info content info.
    */
    static OnVideoPlay(_info: ClassContentPacket) {
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id && _info.video) {

            ClassroomManager.screenManager.imageContent?.stop()
            ClassroomManager.screenManager.videoContent?.stop()
            ClassroomManager.screenManager.currentContent = ClassroomManager.screenManager.videoContent
            for (let i = 0; i < ClassroomManager.screenManager.videoContent.content.length; i++) {
                if (ClassroomManager.screenManager.videoContent.content[i].configuration.src == _info.video.src) {
                    ClassroomManager.screenManager.videoContent.index = i
                    break
                }
            }

            if (!ClassroomManager.screenManager.poweredOn) {
                ClassroomManager.screenManager.powerToggle(true)
            }

            ClassroomManager.screenManager.unHideContent()
            ClassroomManager.screenManager.playContent()
        }
    }

    /**
    * Receives a video pause emit from the teacher and pauses the video for the student.
    *
    * @param _info classroom info.
    */
    static OnVideoPause(_info: ClassPacket) {
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id) {

            if (!ClassroomManager.screenManager.poweredOn) {
                ClassroomManager.screenManager.powerToggle(true)
            }

            ClassroomManager.screenManager.playPause()
        }
    }

    /**
    * Receives a video resume emit from the teacher and resumes the video for the student.
    *
    * @param _info classroom info.
    */
    static OnVideoResume(_info: ClassPacket) {
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id) {

            if (!ClassroomManager.screenManager.poweredOn) {
                ClassroomManager.screenManager.powerToggle(true)
            }

            ClassroomManager.screenManager.playPause()
        }
    }

    /**
    * Receives a video volume emit from the teacher and sets the video's volume for the student.
    *
    * @param _info classroom info and the target volume.
    */
    static OnVideoVolume(_info: ClassPacket & { volume: number }) {
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id) {

            if (!ClassroomManager.screenManager.poweredOn) {
                ClassroomManager.screenManager.powerToggle(true)
            }

            ClassroomManager.screenManager.setVolume(_info.volume)
        }
    }

    /**
    * Receives a model play emit from the teacher and displays that model for the student. By default, it will play the model's animation if it has one.
    *
    * @param _info content info.
    */
    static OnModelPlay(_info: ClassContentPacket) {
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id && _info.model) {

            let shouldStopPrevContent: boolean = true

            if (_info.model.replace !== undefined && _info.model.replace !== null && !_info.model.replace) {
                shouldStopPrevContent = ClassroomManager.screenManager.currentContent.getContent().getContentType() != MediaContentType.model
            }
            if (ClassroomManager.screenManager.currentContent && ClassroomManager.screenManager.currentContent.getContent().getContentType() == MediaContentType.model) {
                if (shouldStopPrevContent) {
                    ClassroomManager.screenManager.currentContent.stop()
                }
            }
            ClassroomManager.screenManager.currentContent = ClassroomManager.screenManager.modelContent
            for (let i = 0; i < ClassroomManager.screenManager.modelContent.content.length; i++) {
                if (ClassroomManager.screenManager.modelContent.content[i].configuration.src == _info.model.src) {
                    ClassroomManager.screenManager.modelContent.index = i
                    break
                }
            }

            if (!ClassroomManager.screenManager.poweredOn) {
                ClassroomManager.screenManager.powerToggle(true)
            }

            ClassroomManager.screenManager.playContent()
        }
    }

    /**
    * Receives a model pause emit from the teacher and pauses the model's animations for the student.
    *
    * @param _info classroom info.
    */
    static OnModelPause(_info: ClassPacket) {
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id) {

            if (!ClassroomManager.screenManager.poweredOn) {
                ClassroomManager.screenManager.powerToggle(true)
            }

            ClassroomManager.screenManager.playPause()
        }
    }

    /**
    * Receives a model resume emit from the teacher and resumes the model's animations for the student.
    *
    * @param _info classroom info.
    */
    static OnModelResume(_info: ClassPacket) {
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id) {

            if (!ClassroomManager.screenManager.poweredOn) {
                ClassroomManager.screenManager.powerToggle(true)
            }

            ClassroomManager.screenManager.playPause()
        }
    }

    /**
    * Receives a screen deactivation emit from the teacher and deactivates the student's screens.
    *
    * @param _info classroom info.
    */
    static OnScreenDeactivation(_info: ClassPacket) {
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id) {

            if (ClassroomManager.screenManager.poweredOn) {
                ClassroomManager.screenManager.videoContent?.stop()
                ClassroomManager.screenManager.hideContent()
            }
        }
    }

    /**
    * Receives a model deactivation emit from the teacher and deactivates the student's models.
    *
    * @param _info classroom info.
    */
    static OnModelDeactivation(_info: ClassPacket) {
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id) {

            if (ClassroomManager.screenManager.poweredOn) {
                ClassroomManager.screenManager.modelContent?.stop()
            }
        }
    }

    /**
    * Receives a content unit start emit from the teacher and starts a content unit for the student.
    *
    * @param _info content unit info.
    */
    static OnContentUnitStart(_info: ContentUnitPacket): void {
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id) {

            ContentUnitManager.start(_info.unit.key, _info.unit.data)
        }
    }

    /**
    * Receives a content unit end emit from the teacher and ends the current content unit for the student.
    *
    * @param _info classroom info.
    */
    static OnContentUnitEnd(_info: ClassPacket): void {
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id) {

            ContentUnitManager.end()
        }
    }

    /**
    * Receives a content unit update emit from the teacher and uses the data to update the content unit for the student.
    *
    * @param _info data packet of any type.
    */
    static OnContentUnitTeacherSend(_info: DataPacket): void {
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id) {

            ContentUnitManager.update(_info.data)
        }
    }

    /**
    * Receives a content unit update emit from the student and uses the data to update the content unit for the teacher.
    *
    * @param _info data packet of any type, plus the student info.
    */
    static OnContentUnitStudentSend(_info: StudentDataPacket): void {
        if (ClassroomManager.classController && ClassroomManager.classController.isTeacher() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id) {

            ContentUnitManager.update(_info.data)
        }
    }
}