import { ClassController } from "./classroomControllers/classController";
import { ClassControllerFactory, ClassControllerType } from "./factories/classControllerFactory";
import { SmartContractManager } from "./smartContractManager";
import { CommunicationManager } from "./comms/communicationManager";
import { Classroom, ClassContent, ClassPacket } from "./classroomObjects";
import { ClassroomFactory } from "./factories/classroomFactory";
import * as classroomConfig from "./classroomConfigs/classroomConfig.json"
import { UserDataHelper } from "./userDataHelper";

export abstract class ClassroomManager {
    static classController: ClassController
    static activeClassroom: Classroom = null
    static activeContent: ClassContent = null
    static requestingJoinClass: boolean = false

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

    static async SetTeacherClassContent(_id: string): Promise<void> {
        SmartContractManager.FetchClassContent(_id)
        .then(function (classContent) {
            ClassroomManager.activeContent = classContent
            ClassroomManager.activeClassroom = ClassroomFactory.CreateTeacherClassroom(JSON.stringify(classroomConfig.classroom), ClassroomManager.activeContent.name, ClassroomManager.activeContent.description)

            CommunicationManager.EmitClassActivation({
                id: ClassroomManager.activeClassroom.guid, //use the class guid for students instead of the active content id
                name: ClassroomManager.activeContent.name,
                description: ClassroomManager.activeContent.description
            })
        })
    }

    static async ActivateClassroom(): Promise<void | ClassPacket[]> {
        return SmartContractManager.ActivateClassroom()
            .then(function (classroomGuid) {
                const valid = SmartContractManager.ValidateClassroomGuid(classroomGuid)
                if(valid) {
                    return SmartContractManager.FetchClassList()
                }
                else {
                    return []
                }
            })
    }

    static async DeactivateClassroom(): Promise<void> {
        return SmartContractManager.DectivateClassroom()
            .then(function () {
                if(ClassroomManager.activeContent) {
                    CommunicationManager.EmitClassDeactivation({
                        id: ClassroomManager.activeClassroom.guid, //use the class guid for students instead of the active content id
                        name: ClassroomManager.activeContent.name,
                        description: ClassroomManager.activeContent.description
                    })
                    ClassroomManager.activeClassroom = null
                }
            })
    }

    static async StartClass(): Promise<void> {
        return SmartContractManager.StartClass()
            .then(function () {
                CommunicationManager.EmitClassStart({
                    id: ClassroomManager.activeClassroom.guid, //use the class guid for students instead of the active content id
                    name: ClassroomManager.activeContent.name,
                    description: ClassroomManager.activeContent.description
                })
            })
    }

    static async EndClass(): Promise<void> {
        return SmartContractManager.EndClass()
            .then(function () {
                CommunicationManager.EmitClassEnd({
                    id: ClassroomManager.activeClassroom.guid, //use the class guid for students instead of the active content id
                    name: ClassroomManager.activeContent.name,
                    description: ClassroomManager.activeContent.description
                })
            })
    }

    static JoinClass(_guid: string): void {
        ClassroomManager.requestingJoinClass = true

        CommunicationManager.EmitClassJoin({
            id: ClassroomManager.classController.classList[ClassroomManager.classController.selectedClassIndex].id,
            name: ClassroomManager.classController.classList[ClassroomManager.classController.selectedClassIndex].name,
            description: ClassroomManager.classController.classList[ClassroomManager.classController.selectedClassIndex].description,
            studentID: UserDataHelper.GetUserId(),
            studentName: UserDataHelper.GetDisplayName()
        })
    }

    static ExitClass(): void {
        if (ClassroomManager.activeClassroom) {
            CommunicationManager.EmitClassExit({
                id: ClassroomManager.activeClassroom.guid,
                name: ClassroomManager.activeClassroom.className,
                description: ClassroomManager.activeClassroom.classDescription,
                studentID: UserDataHelper.GetUserId(),
                studentName: UserDataHelper.GetDisplayName()
            })
            ClassroomManager.activeClassroom = null
        }
    }
}