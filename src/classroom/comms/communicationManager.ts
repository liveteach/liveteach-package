import { MessageBus } from "@dcl/sdk/message-bus"
import { ClassroomManager } from "../classroomManager"
import { DebugPanel } from "../ui/debugPanel"
import { Classroom, StudentCommInfo, ClassPacket } from "../classroomObjects"
import { Color4 } from "@dcl/sdk/math"
import { IClassroomChannel } from "./IClassroomChannel"
import { UserDataHelper } from "../userDataHelper"

export class CommunicationManager {
    static messageBus: MessageBus
    static channel: IClassroomChannel

    static Initialise(_channel: IClassroomChannel): void {
        CommunicationManager.channel = _channel

        if (CommunicationManager.messageBus === undefined || CommunicationManager.messageBus === null) {
            CommunicationManager.messageBus = new MessageBus()

            CommunicationManager.messageBus.on('activate_class', (info: ClassPacket) => {
                if (ClassroomManager.classController && ClassroomManager.classController.isStudent()) {
                    let classFound: boolean = false
                    for (let i = 0; i < ClassroomManager.classController.classList.length; i++) {
                        if (ClassroomManager.classController.classList[i].id == info.id) {
                            ClassroomManager.classController.classList[i].name = info.name
                            ClassroomManager.classController.classList[i].description = info.description
                            classFound = true
                            break
                        }
                    }
                    if (!classFound) {
                        ClassroomManager.classController.classList.push({
                            id: info.id,
                            name: info.name,
                            description: info.description,
                        })
                    }
                }
            })

            CommunicationManager.messageBus.on('deactivate_class', (info: ClassPacket) => {
                if (ClassroomManager.classController && ClassroomManager.classController.isStudent()) {
                    for (let i = 0; i < ClassroomManager.classController.classList.length; i++) {
                        if (ClassroomManager.classController.classList[i].id == info.id) {
                            ClassroomManager.classController.classList.splice(i, 1)
                            if (ClassroomManager.classController.selectedClassIndex == i) {
                                ClassroomManager.classController.selectedClassIndex = Math.max(0, i - 1)
                            }
                            break
                        }
                    }
                }
            })

            CommunicationManager.messageBus.on('start_class', (info: ClassPacket) => {
                if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == info.id) {
                    //TODO
                }
            })

            CommunicationManager.messageBus.on('end_class', (info: ClassPacket) => {
                if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == info.id) {
                    //TODO
                }
            })

            CommunicationManager.messageBus.on('join_class', (info: StudentCommInfo) => {
                if (ClassroomManager.classController && ClassroomManager.classController.isTeacher() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == info.id) {
                    (ClassroomManager.activeClassroom as Classroom).students.push({
                        studentID: info.studentID,
                        studentName: info.studentName
                    })
                    CommunicationManager.EmitClassroomConfig(ClassroomManager.activeClassroom)
                    CommunicationManager.EmitLog(info.studentName + " joined class " + ClassroomManager.activeClassroom.className, info.id, false, true)
                }
            })

            CommunicationManager.messageBus.on('exit_class', (info: StudentCommInfo) => {
                if (ClassroomManager.classController && ClassroomManager.classController.isTeacher() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == info.id) {
                    for (let i = 0; i < (ClassroomManager.activeClassroom as Classroom).students.length; i++) {
                        if ((ClassroomManager.activeClassroom as Classroom).students[i].studentID == info.studentID) {
                            (ClassroomManager.activeClassroom as Classroom).students.splice(i, 1)
                            CommunicationManager.EmitLog(info.studentName + " left class " + ClassroomManager.activeClassroom.className, info.id, false, true)
                            break
                        }
                    }
                }
            })

            CommunicationManager.messageBus.on('share_classroom_config', (info: Classroom) => {
                if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.requestingJoinClass && ClassroomManager.classController.classList[ClassroomManager.classController.selectedClassIndex].id == info.guid) {
                    ClassroomManager.requestingJoinClass = false
                    ClassroomManager.activeClassroom = info
                    CommunicationManager.EmitLog(UserDataHelper.GetDisplayName() + " joined class " + info.className, info.guid, true, false)
                }
            })

            CommunicationManager.messageBus.on('log', (info: any) => {
                const logColor = info.studentEvent ? (info.highPriority ? Color4.Blue() : Color4.Green()) : (info.highPriority ? Color4.Red() : Color4.Yellow())
                DebugPanel.LogClassEvent(info.message, logColor, info.classroomGuid, info.studentEvent, info.global)
            })
        }
    }

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

    static EmitLog(_message: string, _classroomGuid: string, _studentEvent: boolean, _highPriority: boolean, _global: boolean = false): void {
        CommunicationManager.messageBus.emit('log', {
            message: _message,
            classroomGuid: _classroomGuid,
            studentEvent: _studentEvent,
            highPriority: _highPriority,
            global: _global
        })
    }
}