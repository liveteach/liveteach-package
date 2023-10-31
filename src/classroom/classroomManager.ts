import { ClassController } from "./classroomControllers/classController";
import { ClassControllerFactory } from "./factories/classControllerFactory";
import { SmartContractManager } from "./smartContractManager";
import { CommunicationManager } from "./comms/communicationManager";
import { Classroom, ClassContent, ClassPacket, ContentImage, ContentVideo } from "./classroomTypes";
import { ClassroomFactory } from "./factories/classroomFactory";
import { UserDataHelper } from "./userDataHelper";
import { UserType } from "../enums";
import { IClassroomChannel } from "./comms/IClassroomChannel";
import { Entity } from "@dcl/sdk/ecs";

export abstract class ClassroomManager {
    static classController: ClassController
    static activeClassroom: Classroom = null
    static activeContent: ClassContent = null
    static requestingJoinClass: boolean = false
    static classroomConfig: any
    static screens: Entity[] = []

    static Initialise(_classroomConfig: any, _channel: IClassroomChannel, _screens: Entity[]): void {
        ClassroomManager.classroomConfig = _classroomConfig
        ClassroomManager.screens = _screens

        SmartContractManager.Initialise()
        CommunicationManager.Initialise(_channel)
    }

    static SetClassController(type: UserType): void {
        if (ClassroomManager.classController && ClassroomManager.classController.isTeacher() && type === UserType.teacher) {
            ClassroomManager.classController = null
            return
        }

        if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && type === UserType.student) {
            ClassroomManager.classController = null
            return
        }

        if (ClassroomManager.classController && ClassroomManager.classController.isTeacher() && type === UserType.student) {
            ClassroomManager.classController.deactivateClassroom()
        }

        if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && type === UserType.teacher) {
            ClassroomManager.classController.exitClass()
        }

        ClassroomManager.classController = ClassControllerFactory.Create(type)
    }

    static async SetTeacherClassContent(_id: string): Promise<void> {
        SmartContractManager.FetchClassContent(_id)
            .then(function (classContent) {
                ClassroomManager.activeContent = classContent
                ClassroomManager.activeClassroom = ClassroomFactory.CreateTeacherClassroom(JSON.stringify(ClassroomManager.classroomConfig.classroom), ClassroomManager.activeContent.name, ClassroomManager.activeContent.description)

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
                if (valid) {
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
                if (ClassroomManager.activeContent) {
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

    static DisplayImage(_image: ContentImage): void {
        if (!ClassroomManager.classController?.isTeacher()) return

        if (ClassroomManager.activeClassroom) {
            CommunicationManager.EmitImageDisplay({
                id: ClassroomManager.activeClassroom.guid,
                name: ClassroomManager.activeClassroom.className,
                description: ClassroomManager.activeClassroom.classDescription,
                image: _image
            })
        }
    }

    static PlayVideo(_video: ContentVideo): void {
        if (!ClassroomManager.classController?.isTeacher()) return

        if (ClassroomManager.activeClassroom) {
            CommunicationManager.EmitVideoPlay({
                id: ClassroomManager.activeClassroom.guid,
                name: ClassroomManager.activeClassroom.className,
                description: ClassroomManager.activeClassroom.classDescription,
                video: {
                    src: _video.src,
                    caption: _video.caption,
                    playing: true,
                    position: _video.position ?? 0,
                    volume: _video.volume ?? 1,
                }
            })
        }
    }

    static PauseVideo(_video: ContentVideo): void {
        if (!ClassroomManager.classController?.isTeacher()) return

        if (ClassroomManager.activeClassroom) {
            CommunicationManager.EmitVideoPause({
                id: ClassroomManager.activeClassroom.guid,
                name: ClassroomManager.activeClassroom.className,
                description: ClassroomManager.activeClassroom.classDescription,
                video: {
                    src: _video.src,
                    caption: _video.caption,
                    playing: false,
                    position: _video.position ?? 0,
                    volume: _video.volume ?? 1,
                }
            })
        }
    }

    static SetVideoVolume(_video: ContentVideo): void {
        if (!ClassroomManager.classController?.isTeacher()) return

        if (ClassroomManager.activeClassroom) {
            CommunicationManager.EmitVideoVolume({
                id: ClassroomManager.activeClassroom.guid,
                name: ClassroomManager.activeClassroom.className,
                description: ClassroomManager.activeClassroom.classDescription,
                video: {
                    src: _video.src,
                    caption: _video.caption,
                    playing: _video.playing ?? true,
                    position: _video.position ?? 0,
                    volume: _video.volume ?? 1,
                }
            })
        }
    }
}