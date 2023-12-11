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

export class CommunicationManager {
    static readonly CLASS_EMIT_PERIOD: number = 10

    static messageBus: MessageBus
    static channel: IClassroomChannel
    static elapsed: number = 0

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

    static EmitClassStart(_info: ClassPacket): void {
        CommunicationManager.channel.emitClassStart(_info)
        CommunicationManager.EmitLog("You started teaching class " + _info.name, _info.id, false, true)
        CommunicationManager.EmitLog(UserDataHelper.GetDisplayName() + " started teaching " + _info.name, _info.id, true, true, true)
    }

    static EmitClassEnd(_info: ClassPacket): void {
        CommunicationManager.channel.emitClassEnd(_info)
        CommunicationManager.EmitLog("You ended class " + _info.name, _info.id, false, true)
        CommunicationManager.EmitLog(UserDataHelper.GetDisplayName() + " stopped teaching " + _info.name, _info.id, true, true, true)
    }

    static EmitClassJoin(_info: StudentCommInfo): void {
        CommunicationManager.channel.emitClassJoin(_info)
    }

    static EmitClassExit(_info: StudentCommInfo): void {
        CommunicationManager.channel.emitClassExit(_info)
        CommunicationManager.EmitLog(_info.studentName + " left class " + _info.name, _info.id, true, true)
    }

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

    static EmitImageDisplay(_info: ClassContentPacket): void {
        CommunicationManager.channel.emitImageDisplay(_info)
        CommunicationManager.EmitLog("You displayed image: " + _info.image?.src, _info.id, false, false)
        CommunicationManager.EmitLog("Teacher displayed image: " + _info.image?.src, _info.id, true, false)
    }

    static EmitVideoPlay(_info: ClassContentPacket): void {
        CommunicationManager.channel.emitVideoPlay(_info)
        CommunicationManager.EmitLog("You displayed video: " + _info.video?.src, _info.id, false, false)
        CommunicationManager.EmitLog("Teacher displayed video: " + _info.video?.src, _info.id, true, false)
    }

    static EmitVideoPause(_info: ClassPacket): void {
        CommunicationManager.channel.emitVideoPause(_info)
        CommunicationManager.EmitLog("You paused the video", _info.id, false, false)
        CommunicationManager.EmitLog("Teacher paused video", _info.id, true, false)
    }

    static EmitVideoResume(_info: ClassPacket): void {
        CommunicationManager.channel.emitVideoResume(_info)
        CommunicationManager.EmitLog("You resumed the video", _info.id, false, false)
        CommunicationManager.EmitLog("Teacher resumed video", _info.id, true, false)
    }

    static EmitVideoVolume(_info: ClassPacket & { volume: number }): void {
        CommunicationManager.channel.emitVideoVolume(_info)
        const muteStr = _info.volume == 0 ? "muted" : "unmuted"
        CommunicationManager.EmitLog("You " + muteStr + " the video", _info.id, false, false)
        CommunicationManager.EmitLog("Teacher " + muteStr + " video", _info.id, true, false)
    }

    static EmitModelPlay(_info: ClassContentPacket): void {
        CommunicationManager.channel.emitModelPlay(_info)
        CommunicationManager.EmitLog("You displayed model: " + _info.model?.src, _info.id, false, false)
        CommunicationManager.EmitLog("Teacher displayed model: " + _info.model?.src, _info.id, true, false)
    }

    static EmitModelPause(_info: ClassPacket): void {
        CommunicationManager.channel.emitModelPause(_info)
        CommunicationManager.EmitLog("You paused the model", _info.id, false, false)
        CommunicationManager.EmitLog("Teacher paused model", _info.id, true, false)
    }

    static EmitModelResume(_info: ClassPacket): void {
        CommunicationManager.channel.emitModelResume(_info)
        CommunicationManager.EmitLog("You resumed the model", _info.id, false, false)
        CommunicationManager.EmitLog("Teacher resumed model", _info.id, true, false)
    }

    static EmitScreenDeactivation(_info: ClassPacket): void {
        CommunicationManager.channel.emitScreenDeactivation(_info)
        CommunicationManager.EmitLog("You deactivated the screen", _info.id, false, false)
        CommunicationManager.EmitLog("Teacher deactivated screen", _info.id, true, false)
    }

    static EmitModelDeactivation(_info: ClassPacket): void {
        CommunicationManager.channel.emitModelDeactivation(_info)
        CommunicationManager.EmitLog("You deactivated the model", _info.id, false, false)
        CommunicationManager.EmitLog("Teacher deactivated model", _info.id, true, false)
    }

    static EmitContentUnitStart(_info: ContentUnitPacket): void {
        CommunicationManager.channel.emitContentUnitStart(_info)
        CommunicationManager.EmitLog("You started a content unit: " + _info.unit.key, _info.id, false, false)
        CommunicationManager.EmitLog("Teacher started a content unit: " + _info.unit.key, _info.id, true, false)
    }

    static EmitContentUnitEnd(_info: ClassPacket): void {
        CommunicationManager.channel.emitContentUnitEnd(_info)
        CommunicationManager.EmitLog("You ended the content unit", _info.id, false, false)
        CommunicationManager.EmitLog("Teacher ended content unit", _info.id, true, false)
    }

    static EmitContentUnitTeacherSend(_info: DataPacket): void {
        CommunicationManager.channel.emitContentUnitTeacherSend(_info)
    }

    static EmitContentUnitStudentSend(_info: StudentDataPacket): void {
        CommunicationManager.channel.emitContentUnitStudentSend(_info)
    }

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

    static OnEndClass(_info: ClassPacket): void {
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent()) {
            if (ClassroomManager.screenManager.poweredOn) {
                ClassroomManager.screenManager.videoContent?.stop()
                ClassroomManager.screenManager.hideContent()
            }

            if (ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id) {
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
            CommunicationManager.EmitLog(UserDataHelper.GetDisplayName() + " joined class " + _info.config.className, _info.config.guid, true, false)
        }
    }

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

    static OnVideoPause(_info: ClassPacket) {
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id) {

            if (!ClassroomManager.screenManager.poweredOn) {
                ClassroomManager.screenManager.powerToggle(true)
            }

            ClassroomManager.screenManager.playPause()
        }
    }

    static OnVideoResume(_info: ClassPacket) {
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id) {

            if (!ClassroomManager.screenManager.poweredOn) {
                ClassroomManager.screenManager.powerToggle(true)
            }

            ClassroomManager.screenManager.playPause()
        }
    }

    static OnVideoVolume(_info: ClassPacket & { volume: number }) {
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id) {

            if (!ClassroomManager.screenManager.poweredOn) {
                ClassroomManager.screenManager.powerToggle(true)
            }

            ClassroomManager.screenManager.setVolume(_info.volume)
        }
    }

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

    static OnModelPause(_info: ClassPacket) {
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id) {

            if (!ClassroomManager.screenManager.poweredOn) {
                ClassroomManager.screenManager.powerToggle(true)
            }

            ClassroomManager.screenManager.playPause()
        }
    }

    static OnModelResume(_info: ClassPacket) {
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id) {

            if (!ClassroomManager.screenManager.poweredOn) {
                ClassroomManager.screenManager.powerToggle(true)
            }

            ClassroomManager.screenManager.playPause()
        }
    }

    static OnScreenDeactivation(_info: ClassPacket) {
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id) {

            if (ClassroomManager.screenManager.poweredOn) {
                ClassroomManager.screenManager.videoContent?.stop()
                ClassroomManager.screenManager.hideContent()
            }
        }
    }

    static OnModelDeactivation(_info: ClassPacket) {
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id) {

            if (ClassroomManager.screenManager.poweredOn) {
                ClassroomManager.screenManager.modelContent?.stop()
            }
        }
    }

    static OnContentUnitStart(_info: ContentUnitPacket): void {
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id) {

            ContentUnitManager.start(_info.unit.key, _info.unit.data)
        }
    }

    static OnContentUnitEnd(_info: ClassPacket): void {
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id) {

            ContentUnitManager.end()
        }
    }

    static OnContentUnitTeacherSend(_info: DataPacket): void {
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id) {

            ContentUnitManager.update(_info.data)
        }
    }

    static OnContentUnitStudentSend(_info: StudentDataPacket): void {
        if (ClassroomManager.classController && ClassroomManager.classController.isTeacher() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id) {

            ContentUnitManager.update(_info.data)
        }
    }
}