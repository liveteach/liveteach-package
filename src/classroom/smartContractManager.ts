import { ClassContent, ClassPacket } from "./types/classroomTypes"
import { BlockChain } from "./blockchain"
import { ClassContentFactory } from "./factories/classContentFactory"
import { ClassroomManager } from "./classroomManager"
import { Transform, engine, executeTask } from "@dcl/sdk/ecs"
import { UserType } from "../enums"
import * as exampleConfig from "../classroomContent/liveTeachConfigs/exampleConfig.json"

export class SmartContractManager {
    private static readonly TEST_TEACHER_ADDRESSES: string[] = [
        "0xe5cf1BB88a59F9fC609689C681D1d14bfE7Ce73A",
        "0xbEA7Ad6cdb932fD81EB386cc9BD21E426b99cB37"
    ]

    private static currentUserParcel: [number, number] = [0, 0]
    static blockchain: BlockChain

    static Initialise(liveTeachContractAddress?:string, teachersContractAddress?:string): void {
        if (SmartContractManager.blockchain === undefined || SmartContractManager.blockchain === null) {
            SmartContractManager.blockchain = new BlockChain(liveTeachContractAddress, teachersContractAddress)
        }
        engine.addSystem(SmartContractManager.update)
    }

    static async ActivateClassroom(_parcel: [number, number]): Promise<string> {
        if (!SmartContractManager.blockchain.userData || !SmartContractManager.blockchain.userData.userId) return ""

        if (ClassroomManager.testMode) {
            const config = ClassroomManager.GetClassroomConfig()
            if (config) {
                let authorized: boolean = config.classroom.teacherID.toLowerCase() == SmartContractManager.blockchain.userData.userId.toLowerCase()
                for (let address of SmartContractManager.TEST_TEACHER_ADDRESSES) {
                    if (address.toLowerCase() == SmartContractManager.blockchain.userData.userId.toLowerCase()) {
                        authorized = true
                        break
                    }
                }
                return authorized ? "382c74c3-721d-4f34-80e5-57657b6cbc27" : ""
            }
            else {
                return ""
            }
        }
        else {
            return SmartContractManager.blockchain.getClassroomGuid(_parcel)
        }
    }

    static async DectivateClassroom(): Promise<void> {
        if (ClassroomManager.testMode) {

        }
        else {
            //TODO
        }
    }

    static async FetchClassList(): Promise<ClassPacket[]> {
        if (ClassroomManager.testMode) {
            let classList: ClassPacket[] = []
            classList.push({
                id: exampleConfig.content.id,
                name: exampleConfig.content.name,
                description: exampleConfig.content.description
            })
            return classList
        }
        else {
            return SmartContractManager.blockchain.getClassContentList()
        }
    }

    static async FetchClassContent(_id: string): Promise<ClassContent> {
        let contentJson: string = ""
        if (ClassroomManager.testMode) {
            switch (_id) {
                case exampleConfig.content.id: contentJson = JSON.stringify(exampleConfig.content)
                    break
            }
        }
        else {
            contentJson = await SmartContractManager.blockchain.getClassContent(Number(_id))
        }

        if (contentJson && contentJson.length > 0) {
            return ClassContentFactory.Create(contentJson)
        }
        return new ClassContent()
    }

    static async StartClass(): Promise<void> {
        if (ClassroomManager.testMode) {

        }
        else {
            SmartContractManager.blockchain.startClass()
        }
    }

    static async EndClass(): Promise<void> {
        if (ClassroomManager.testMode) {
        }
        else {
            //TODO
        }
    }

    private static ValidateClassroomGuid(_guid: string): boolean {
        const config = ClassroomManager.GetClassroomConfig()
        if (config) {
            return config.classroom.guid === _guid
        }
        return false
    }

    private static update(): void {
        const userPos = Transform.get(engine.PlayerEntity).position
        const userParcel = SmartContractManager.blockchain.getUserParcel(userPos.x, userPos.z)

        if (Math.abs(userParcel[0]) > 500 || Math.abs(userParcel[1]) > 500) return
        if (SmartContractManager.currentUserParcel[0] == userParcel[0] && SmartContractManager.currentUserParcel[1] == userParcel[1]) return

        //User changed parcels
        SmartContractManager.currentUserParcel = userParcel

        executeTask(async () => {
            SmartContractManager.ActivateClassroom(SmartContractManager.currentUserParcel).then(
                function (classroomGuid: string) {
                    const valid = SmartContractManager.ValidateClassroomGuid(classroomGuid)
                    if (valid) {
                        // if the user is already a teacher, don't do anything
                        if (ClassroomManager.classController?.isTeacher()) return

                        ClassroomManager.SetClassController(UserType.teacher)
                        SmartContractManager.FetchClassList().then(
                            function (classList) {
                                if (ClassroomManager.classController) {
                                    ClassroomManager.classController.classList = classList as ClassPacket[]
                                    ClassroomManager.classController.setClassroom()
                                }
                            })
                            .catch(function (error) {
                                console.error(error)
                            })
                    }
                    else {
                        //User is not authorized to teach this parcel

                        // if the user is already a student, don't do anything
                        if (ClassroomManager.classController?.isStudent()) return

                        ClassroomManager.SetClassController(UserType.student)
                    }
                }
            )
        })
    }
}