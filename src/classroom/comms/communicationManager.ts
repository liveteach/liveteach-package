// @ts-nocheck
import { MessageBus } from "@dcl/sdk/message-bus"
import { ClassroomManager } from "../classroomManager"
import { DebugPanel } from "../ui/debugPanel"
import { Color4 } from "@dcl/sdk/math"
import { IClassroomChannel } from "./IClassroomChannel"
import { UserDataHelper } from "../userDataHelper"
import { ClassContentPacket, ClassPacket, Classroom, StudentCommInfo } from "../types/classroomTypes"

export class CommunicationManager {
    static messageBus: MessageBus
    static channel: IClassroomChannel

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
            CommunicationManager.messageBus.on('play_video', CommunicationManager.OnVideoDisplay)
            CommunicationManager.messageBus.on('pause_video', CommunicationManager.OnVideoDisplay)
            CommunicationManager.messageBus.on('set_video_volume', CommunicationManager.OnVideoDisplay)
            CommunicationManager.messageBus.on('display_model', CommunicationManager.OnModelDisplay)

            CommunicationManager.messageBus.on('log', (info: any) => {
                const logColor = info.studentEvent ? (info.highPriority ? Color4.Blue() : Color4.Green()) : (info.highPriority ? Color4.Red() : Color4.Yellow())
                DebugPanel.LogClassEvent(info.message, logColor, info.classroomGuid, info.studentEvent, info.global)
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

    static EmitClassroomConfig(_info: Classroom): void {
        CommunicationManager.channel.emitClassroomConfig(_info)
        CommunicationManager.EmitLog(_info.teacherName + " is sharing classroom config for class " + _info.className, _info.guid, false, false)
    }

    static EmitImageDisplay(_info: ClassContentPacket): void {
        CommunicationManager.channel.emitImageDisplay(_info)
        //TODO: Add log
    }

    static EmitVideoPlay(_info: ClassContentPacket): void {
        CommunicationManager.channel.emitVideoPlay(_info)
        //TODO: Add log
    }

    static EmitVideoPause(_info: ClassContentPacket): void {
        CommunicationManager.channel.emitVideoPlay(_info)
        //TODO: Add log
    }

    static EmitVideoVolume(_info: ClassContentPacket): void {
        CommunicationManager.channel.emitVideoPlay(_info)
        //TODO: Add log
    }

    static EmitModelDisplay(_info: ClassContentPacket): void {
        CommunicationManager.channel.emitModelDisplay(_info)
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
        }
    }

    static OnDeactivateClass(_info: ClassPacket): void {
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

    static OnStartClass(_info: ClassPacket): void {
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id) {
            //TODO
        }
    }

    static OnEndClass(_info: ClassPacket): void {
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id) {
            //TODO
        }
    }

    static OnJoinClass(_info: StudentCommInfo) {
        if (ClassroomManager.classController && ClassroomManager.classController.isTeacher() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id) {
            (ClassroomManager.activeClassroom as Classroom).students.push({
                studentID: _info.studentID,
                studentName: _info.studentName
            })
            CommunicationManager.EmitClassroomConfig(ClassroomManager.activeClassroom)
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

    static OnImageDisplay(_info: ClassContentPacket) {
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id) {

            ClassroomManager.screenManager.addStudentContent(_info.image, _info.video, _info.model)
            if (!ClassroomManager.screenManager.poweredOn) {
                ClassroomManager.screenManager.powerToggle(true)
            }

            ClassroomManager.screenManager.playContent()

            return
            //TODO: Add log
        }
    }

    static OnVideoDisplay(_info: ClassContentPacket) {
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id) {

            ClassroomManager.screenManager.addStudentContent(_info.image, _info.video, _info.model)
            if (!ClassroomManager.screenManager.poweredOn) {
                ClassroomManager.screenManager.powerToggle(true)
            }

            ClassroomManager.screenManager.playContent()

            return
            //TODO: Add log
        }
    }

    static OnModelDisplay(_info: ClassContentPacket) {
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _info.id) {

            ClassroomManager.screenManager.addStudentContent(_info.image, _info.video, _info.model)
            if (!ClassroomManager.screenManager.poweredOn) {
                ClassroomManager.screenManager.powerToggle(true)
            }
 
            ClassroomManager.screenManager.playContent()

            return
            //TODO: Add log
        }
    }

    static OnShareClassroomConfig(_info: Classroom) {
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.requestingJoinClass && ClassroomManager.classController.classList[ClassroomManager.classController.selectedClassIndex].id == _info.guid) {
            ClassroomManager.requestingJoinClass = false
            ClassroomManager.activeClassroom = _info
            CommunicationManager.EmitLog(UserDataHelper.GetDisplayName() + " joined class " + _info.className, _info.guid, true, false)
        }
    }
}