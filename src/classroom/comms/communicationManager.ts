import { MessageBus } from "@dcl/sdk/message-bus"
import { ClassroomManager } from "../classroomManager"
import { DebugPanel } from "../ui/debugPanel"
import { Color4 } from "@dcl/sdk/math"
import { IClassroomChannel } from "./IClassroomChannel"
import { UserDataHelper } from "../userDataHelper"
import { ClassContentPacket, ClassPacket, Classroom, StudentCommInfo, ContentUnitPacket, DataPacket, StudentDataPacket, ClassContent, ClassroomSharePacket } from "../types/classroomTypes"
import { ContentUnitManager } from "../../contentUnits/contentUnitManager"
import { engine } from "@dcl/sdk/ecs"
import { MediaContentType } from "../../classroomContent/enums";

export class CommunicationManager {
    static readonly CLASS_EMIT_PERIOD: number = 10

    static messageBus: MessageBus
    static channel: IClassroomChannel
    static elapsed: number = 0

    static Initialise(_channel: IClassroomChannel): void {
        CommunicationManager.channel = _channel

        if (CommunicationManager.messageBus === undefined || CommunicationManager.messageBus === null) {
            CommunicationManager.messageBus = new MessageBus()

            CommunicationManager.messageBus.on('activate_class', CommunicationManager.OnActivateClass)
            CommunicationManager.messageBus.on('deactivate_class', CommunicationManager.OnDeactivateClass)
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
                if (!ClassroomManager.classController?.isTeacher() || !ClassroomManager.activeClassroom) return

                CommunicationManager.elapsed += dt
                if (CommunicationManager.elapsed > CommunicationManager.CLASS_EMIT_PERIOD) {
                    CommunicationManager.elapsed = 0

                    ClassroomManager.UpdateClassroom()
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

    static EmitClassActivation(_info: ClassPacket): void {
        CommunicationManager.channel.emitClassActivation(_info)
        CommunicationManager.EmitLog(UserDataHelper.GetDisplayName() + " activated class " + _info.name, _info.id, false, false)
        CommunicationManager.EmitLog("New class available: " + _info.name, _info.id, true, false, true)
    }

    static EmitClassDeactivation(_info: ClassPacket): void {
        CommunicationManager.channel.emitClassDeactivation(_info)
        CommunicationManager.EmitLog(UserDataHelper.GetDisplayName() + " deactivated class " + _info.name, _info.id, false, false)
        CommunicationManager.EmitLog("Class no longer available: " + _info.name, _info.id, true, false, true)
    }

    static EmitClassStart(_info: ClassPacket): void {
        CommunicationManager.channel.emitClassStart(_info)
        CommunicationManager.EmitLog(UserDataHelper.GetDisplayName() + " started class " + _info.name, _info.id, false, true)
        CommunicationManager.EmitLog(UserDataHelper.GetDisplayName() + " started teaching " + _info.name, _info.id, true, true)
    }

    static EmitClassEnd(_info: ClassPacket): void {
        CommunicationManager.channel.emitClassEnd(_info)
        CommunicationManager.EmitLog(UserDataHelper.GetDisplayName() + " ended class " + _info.name, _info.id, false, true)
        CommunicationManager.EmitLog(UserDataHelper.GetDisplayName() + " stopped teaching " + _info.name, _info.id, true, true)
    }

    static EmitClassJoin(_info: StudentCommInfo): void {
        CommunicationManager.channel.emitClassJoin(_info)
    }

    static EmitClassExit(_info: StudentCommInfo): void {
        CommunicationManager.channel.emitClassExit(_info)
        CommunicationManager.EmitLog(_info.studentName + " left class " + _info.name, _info.id, true, true)
    }

    static EmitClassroomConfig(_config: Classroom, _content: ClassContent): void {
        CommunicationManager.channel.emitClassroomConfig({
            config: _config,
            content: _content
        })
        CommunicationManager.EmitLog(_config.teacherName + " is sharing classroom config for class " + _config.className, _config.guid, false, false)
    }

    static EmitImageDisplay(_info: ClassContentPacket): void {
        CommunicationManager.channel.emitImageDisplay(_info)
        //TODO: Add log
    }

    static EmitVideoPlay(_info: ClassContentPacket): void {
        CommunicationManager.channel.emitVideoPlay(_info)
        //TODO: Add log
    }

    static EmitVideoPause(_info: ClassPacket): void {
        CommunicationManager.channel.emitVideoPause(_info)
        //TODO: Add log
    }

    static EmitVideoResume(_info: ClassPacket): void {
        CommunicationManager.channel.emitVideoResume(_info)
        //TODO: Add log
    }

    static EmitVideoVolume(_info: ClassPacket & { volume: number }): void {
        CommunicationManager.channel.emitVideoVolume(_info)
        //TODO: Add log
    }

    static EmitModelPlay(_info: ClassContentPacket): void {
        CommunicationManager.channel.emitModelPlay(_info)
        //TODO: Add log
    }

    static EmitModelPause(_info: ClassPacket): void {
        CommunicationManager.channel.emitModelPause(_info)
        //TODO: Add log
    }

    static EmitModelResume(_info: ClassPacket): void {
        CommunicationManager.channel.emitModelResume(_info)
        //TODO: Add log
    }

    static EmitScreenDeactivation(_info: ClassPacket): void {
        CommunicationManager.channel.emitScreenDeactivation(_info)
        //TODO: Add log
    }

    static EmitModelDeactivation(_info: ClassPacket): void {
        CommunicationManager.channel.emitModelDeactivation(_info)
        //TODO: Add log
    }

    static EmitContentUnitStart(_info: ContentUnitPacket): void {
        CommunicationManager.channel.emitContentUnitStart(_info)
        //TODO: Add log
    }

    static EmitContentUnitEnd(_info: ClassPacket): void {
        CommunicationManager.channel.emitContentUnitEnd(_info)
        //TODO: Add log
    }

    static EmitContentUnitTeacherSend(_info: DataPacket): void {
        CommunicationManager.channel.emitContentUnitTeacherSend(_info)
        //TODO: Add log
    }

    static EmitContentUnitStudentSend(_info: StudentDataPacket): void {
        CommunicationManager.channel.emitContentUnitStudentSend(_info)
        //TODO: Add log
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

    static OnActivateClass(_info: ClassPacket): void {

    }

    static OnDeactivateClass(_info: ClassPacket): void {

    }

    static OnStartClass(_info: ClassPacket): void {
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent()) {

            let classFound: boolean = false
            for (let i = 0; i < ClassroomManager.classController.classList.length; i++) {
                if (ClassroomManager.classController.classList[i].id == _info.id) {
                    ClassroomManager.classController.classList[i].name = _info.name
                    ClassroomManager.classController.classList[i].description = _info.description
                    classFound = true
                    break
                }
            }
            if (!classFound) {
                ClassroomManager.classController.classList.push({
                    id: _info.id,
                    name: _info.name,
                    description: _info.description,
                })
            }

            const config = ClassroomManager.GetClassroomConfig()
            if (config) {
                //autojoin
                if (ClassroomManager.activeClassroom?.guid != _info.id && config.classroom.autojoin) {
                    ClassroomManager.JoinClass()
                }
            }
        }
    }

    static OnEndClass(_info: ClassPacket): void {
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent()) {
            if (ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id) {
                ClassroomManager.ExitClass()
            }

            if (ClassroomManager.classController && ClassroomManager.classController.isStudent()) {
                for (let i = 0; i < ClassroomManager.classController.classList.length; i++) {
                    if (ClassroomManager.classController.classList[i].id == _info.id) {
                        ClassroomManager.classController.classList.splice(i, 1)
                        if (ClassroomManager.classController.selectedClassIndex == i) {
                            ClassroomManager.classController.selectedClassIndex = Math.max(0, i - 1)
                        }
                        break
                    }
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
            CommunicationManager.EmitClassroomConfig(ClassroomManager.activeClassroom, ClassroomManager.activeContent)
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
            ClassroomManager.SyncClassroom()
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

            //TODO: Add log
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

            //TODO: Add log
        }
    }

    static OnVideoPause(_info: ClassPacket) {
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id) {

            if (!ClassroomManager.screenManager.poweredOn) {
                ClassroomManager.screenManager.powerToggle(true)
            }

            ClassroomManager.screenManager.playPause()

            //TODO: Add log
        }
    }

    static OnVideoResume(_info: ClassPacket) {
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id) {

            if (!ClassroomManager.screenManager.poweredOn) {
                ClassroomManager.screenManager.powerToggle(true)
            }

            ClassroomManager.screenManager.playPause()

            //TODO: Add log
        }
    }

    static OnVideoVolume(_info: ClassPacket & { volume: number }) {
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id) {

            if (!ClassroomManager.screenManager.poweredOn) {
                ClassroomManager.screenManager.powerToggle(true)
            }

            ClassroomManager.screenManager.setVolume(_info.volume)

            //TODO: Add log
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

            //TODO: Add log
        }
    }

    static OnModelPause(_info: ClassPacket) {
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id) {

            if (!ClassroomManager.screenManager.poweredOn) {
                ClassroomManager.screenManager.powerToggle(true)
            }

            ClassroomManager.screenManager.playPause()

            //TODO: Add log
        }
    }

    static OnModelResume(_info: ClassPacket) {
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id) {

            if (!ClassroomManager.screenManager.poweredOn) {
                ClassroomManager.screenManager.powerToggle(true)
            }

            ClassroomManager.screenManager.playPause()

            //TODO: Add log
        }
    }

    static OnScreenDeactivation(_info: ClassPacket) {
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id) {

            if (ClassroomManager.screenManager.poweredOn) {
                ClassroomManager.screenManager.videoContent?.stop()
                ClassroomManager.screenManager.hideContent()
            }

            //TODO: Add log
        }
    }

    static OnModelDeactivation(_info: ClassPacket) {
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id) {

            if (ClassroomManager.screenManager.poweredOn) {
                ClassroomManager.screenManager.modelContent?.stop()
            }

            //TODO: Add log
        }
    }

    static OnContentUnitStart(_info: ContentUnitPacket): void {
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id) {

            ContentUnitManager.start(_info.unit.key, _info.unit.data)

            //TODO: Add log
        }
    }

    static OnContentUnitEnd(_info: ClassPacket): void {
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id) {

            ContentUnitManager.end()

            //TODO: Add log
        }
    }

    static OnContentUnitTeacherSend(_info: DataPacket): void {
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id) {

            ContentUnitManager.update(_info.data)

            //TODO: Add log
        }
    }

    static OnContentUnitStudentSend(_info: StudentDataPacket): void {
        if (ClassroomManager.classController && ClassroomManager.classController.isTeacher() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id) {

            ContentUnitManager.update(_info.data)

            //TODO: Add log
        }
    }
}