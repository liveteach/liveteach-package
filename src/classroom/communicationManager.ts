import { MessageBus } from "@dcl/sdk/message-bus"
import { ClassroomManager } from "./classroomManager"
import { DebugPanel } from "./ui/debugPanel"
import { TeacherClassroom, TeacherCommInfo, StudentCommInfo } from "./classroom"
import { ClassroomFactory } from "./factories/classroomFactory"
import { Color4 } from "@dcl/sdk/math"
import { ClassMemberData } from "./classMemberData"

export class CommunicationManager {
    static messageBus: MessageBus

    static Initialise(): void {
        if (CommunicationManager.messageBus === undefined || CommunicationManager.messageBus === null) {
            CommunicationManager.messageBus = new MessageBus()

            CommunicationManager.messageBus.on('activate_class', (info: StudentCommInfo) => {
                if (ClassroomManager.classController && ClassroomManager.classController.isStudent()) {
                    let classFound: boolean = false
                    for (let i = 0; i < ClassroomManager.classController.classList.length; i++) {
                        if (ClassroomManager.classController.classList[i].teacherID == info.teacherID) {
                            ClassroomManager.classController.classList[i].classID = info.classID
                            ClassroomManager.classController.classList[i].className = info.className
                            classFound = true
                            CommunicationManager.EmitLog(info.teacherName + " activated " + info.className, info.guid, true, false)
                            break
                        }
                    }
                    if (!classFound) {
                        ClassroomManager.classController.classList.push(ClassroomFactory.CreateStudentClassroom(info))
                        CommunicationManager.EmitLog(info.teacherName + " activated " + info.className, info.guid, true, false)
                    }
                }
            })

            CommunicationManager.messageBus.on('deactivate_class', (info: StudentCommInfo) => {
                if (ClassroomManager.classController && ClassroomManager.classController.isStudent()) {
                    for (let i = 0; i < ClassroomManager.classController.classList.length; i++) {
                        if (ClassroomManager.classController.classList[i].teacherID == info.teacherID) {
                            ClassroomManager.classController.classList.splice(i, 1)
                            if (ClassroomManager.classController.selectedClassIndex == i) {
                                ClassroomManager.classController.selectedClassIndex = Math.max(0, i - 1)
                            }
                            CommunicationManager.EmitLog(info.teacherName + " deactivated " + info.className, info.guid, true, false)
                            break
                        }
                    }
                }
            })

            CommunicationManager.messageBus.on('start_class', (info: StudentCommInfo) => {
                if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.teacherID == info.teacherID) {
                    CommunicationManager.EmitLog(info.teacherName + " started teaching " + info.className, info.guid, true, true)
                }
            })

            CommunicationManager.messageBus.on('end_class', (info: StudentCommInfo) => {
                if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.teacherID == info.teacherID) {
                    CommunicationManager.EmitLog(info.teacherName + " stopped teaching " + info.className, info.guid, true, true)
                }
            })

            CommunicationManager.messageBus.on('join_class', (info: TeacherCommInfo) => {
                if (ClassroomManager.classController && ClassroomManager.classController.isTeacher() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.teacherID == info.teacherID) {
                    (ClassroomManager.activeClassroom as TeacherClassroom).students.push({
                        studentID: info.studentID,
                        studentName: info.studentName
                    })
                    CommunicationManager.EmitLog(info.studentName + " left class " + info.className, info.guid, false, true)
                }
                else if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.teacherID == info.teacherID && ClassMemberData.GetUserId() != info.studentID) {
                    CommunicationManager.EmitLog(info.studentName + " left class " + info.className, info.guid, true, false)
                }
            })

            CommunicationManager.messageBus.on('exit_class', (info: TeacherCommInfo) => {
                if (ClassroomManager.classController && ClassroomManager.classController.isTeacher() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.teacherID == info.teacherID) {
                    for (let i = 0; i < (ClassroomManager.activeClassroom as TeacherClassroom).students.length; i++) {
                        if ((ClassroomManager.activeClassroom as TeacherClassroom).students[i].studentID == info.studentID) {
                            (ClassroomManager.activeClassroom as TeacherClassroom).students.splice(i, 1)
                            console.log(info.studentName + " left your class")
                            break
                        }
                    }
                }
                else if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.teacherID == info.teacherID && ClassMemberData.GetUserId() != info.studentID) {
                    console.log(info.studentName + " left the class")
                }
            })

            CommunicationManager.messageBus.on('log', (info: any) => {
                const logColor = info.studentEvent ? (info.highPriority ? Color4.Blue() : Color4.Green()) : (info.highPriority ? Color4.Red() : Color4.Yellow())
                DebugPanel.LogClassEvent(info.message, logColor, info.classroomGuid, info.studentEvent)
            })
        }
    }

    static EmitClassActivation(_info: StudentCommInfo): void {
        CommunicationManager.messageBus.emit('activate_class', _info)
        CommunicationManager.EmitLog(_info.teacherName + " activated class " + _info.className, _info.guid, false, false)
    }

    static EmitClassDeactivation(_info: StudentCommInfo): void {
        CommunicationManager.messageBus.emit('deactivate_class', _info)
        CommunicationManager.EmitLog(_info.teacherName + " deactivated class " + _info.className, _info.guid, false, false)
    }

    static EmitClassStart(_info: StudentCommInfo): void {
        CommunicationManager.messageBus.emit('start_class', _info)
        CommunicationManager.EmitLog(_info.teacherName + " started class " + _info.className, _info.guid, false, true)
    }

    static EmitClassEnd(_info: StudentCommInfo): void {
        CommunicationManager.messageBus.emit('end_class', _info)
        CommunicationManager.EmitLog(_info.teacherName + " ended class " + _info.className, _info.guid, false, true)
    }

    static EmitClassJoin(_info: TeacherCommInfo): void {
        CommunicationManager.messageBus.emit('join_class', _info)
        CommunicationManager.EmitLog(_info.studentName + " joined class " + _info.className, _info.guid, true, true)
    }

    static EmitClassExit(_info: TeacherCommInfo): void {
        CommunicationManager.messageBus.emit('exit_class', _info)
        CommunicationManager.EmitLog(_info.studentName + " left class " + _info.className, _info.guid, true, true)
    }

    static EmitLog(_message: string, _classroomGuid: string, _studentEvent: boolean, _highPriority: boolean): void {
        CommunicationManager.messageBus.emit('log', {
            message: _message,
            classroomGuid: _classroomGuid,
            studentEvent: _studentEvent,
            highPriority: _highPriority
        })
    }
}