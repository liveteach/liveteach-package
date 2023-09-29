import { ClassController } from "./classroomControllers/classController";
import { ClassControllerFactory, ClassControllerType } from "./factories/classControllerFactory";
import { SmartContractManager } from "./smartContractManager";
import { CommunicationManager } from "./communicationManager";
import { TeacherClassroom, StudentClassroom } from "./classroom";
import { ClassMemberData } from "./classMemberData";
import { executeTask } from "@dcl/sdk/ecs";

export abstract class ClassroomManager {
    static classController: ClassController
    static activeClassroom: TeacherClassroom | StudentClassroom = null

    static Initialise(): void {
        SmartContractManager.Initialise()
        CommunicationManager.Initialise()
    }

    static SetClassController(type: ClassControllerType): void {
        if (ClassroomManager.classController && ClassroomManager.classController.isTeacher() && type === ClassControllerType.TEACHER) {
            ClassroomManager.classController = null
            return
        }

        if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && type === ClassControllerType.STUDENT) {
            ClassroomManager.classController = null
            return
        }

        if (ClassroomManager.classController && ClassroomManager.classController.isTeacher() && type === ClassControllerType.STUDENT) {
            ClassroomManager.classController.deactivateClassroom()
        }

        if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && type === ClassControllerType.TEACHER) {
            ClassroomManager.classController.exitClass()
        }

        ClassroomManager.classController = ClassControllerFactory.Create(type)
    }

    static SetTeacherClassroom(_info: TeacherClassroom): void {
        ClassroomManager.activeClassroom = _info

        CommunicationManager.EmitClassActivation({
            guid: ClassroomManager.activeClassroom.guid,
            teacherID: ClassroomManager.activeClassroom.teacherID,
            teacherName: ClassroomManager.activeClassroom.teacherName,
            classID: ClassroomManager.activeClassroom.classID,
            className: ClassroomManager.activeClassroom.className
        })
    }

    static async ActivateClassroom(): Promise<void | TeacherClassroom[]> {
        return SmartContractManager.ActivateClassroom("location") //TODO: use actual location
            .then(function (classroomGuid) {
                //TODO: Validate ID
                return SmartContractManager.FetchClassContent(classroomGuid)
            })
    }

    static async DeactivateClassroom(): Promise<void> {
        return SmartContractManager.DectivateClassroom("location") //TODO: use actual location
            .then(function () {
                CommunicationManager.EmitClassDeactivation({
                    guid: ClassroomManager.activeClassroom.guid,
                    teacherID: ClassroomManager.activeClassroom.teacherID,
                    teacherName: ClassroomManager.activeClassroom.teacherName,
                    classID: ClassroomManager.activeClassroom.classID,
                    className: ClassroomManager.activeClassroom.className
                })
                ClassroomManager.activeClassroom = null
            })
    }

    static async StartClass(): Promise<void> {
        return SmartContractManager.StartClass()
            .then(function () {
                CommunicationManager.EmitClassStart({
                    guid: ClassroomManager.activeClassroom.guid,
                    teacherID: ClassroomManager.activeClassroom.teacherID,
                    teacherName: ClassroomManager.activeClassroom.teacherName,
                    classID: ClassroomManager.activeClassroom.classID,
                    className: ClassroomManager.activeClassroom.className
                })
            })
    }

    static async EndClass(): Promise<void> {
        return SmartContractManager.EndClass()
            .then(function () {
                CommunicationManager.EmitClassEnd({
                    guid: ClassroomManager.activeClassroom.guid,
                    teacherID: ClassroomManager.activeClassroom.teacherID,
                    teacherName: ClassroomManager.activeClassroom.teacherName,
                    classID: ClassroomManager.activeClassroom.classID,
                    className: ClassroomManager.activeClassroom.className
                })
            })
    }

    static JoinClass(_info: StudentClassroom): void {
        ClassroomManager.activeClassroom = _info

        CommunicationManager.EmitClassJoin({
            guid: ClassroomManager.activeClassroom.guid,
            teacherID: ClassroomManager.activeClassroom.teacherID,
            teacherName: ClassroomManager.activeClassroom.teacherName,
            classID: ClassroomManager.activeClassroom.classID,
            className: ClassroomManager.activeClassroom.className,
            studentID: ClassMemberData.GetUserId(),
            studentName: ClassMemberData.GetDisplayName()
        })
    }

    static ExitClass(): void {
        if (ClassroomManager.activeClassroom) {
            CommunicationManager.EmitClassExit({
                guid: ClassroomManager.activeClassroom.guid,
                teacherID: ClassroomManager.activeClassroom.teacherID,
                teacherName: ClassroomManager.activeClassroom.teacherName,
                classID: ClassroomManager.activeClassroom.classID,
                className: ClassroomManager.activeClassroom.className,
                studentID: ClassMemberData.GetUserId(),
                studentName: ClassMemberData.GetDisplayName()
            })
            ClassroomManager.activeClassroom = null
        }
    }
}