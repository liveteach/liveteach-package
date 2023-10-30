import { ClassContent, ClassPacket } from "./classroomObjects"
import { BlockChain } from "./blockchain"
import * as exampleConfig from "./liveTeachConfigs/exampleConfig.json"
import * as biologyConfig from "./liveTeachConfigs/biologyConfig.json"
import * as frenchConfig from "./liveTeachConfigs/frenchConfig.json"
import * as historyConfig from "./liveTeachConfigs/historyConfig.json"
import * as mathConfig from "./liveTeachConfigs/mathConfig.json"
import * as physicsConfig from "./liveTeachConfigs/physicsConfig.json"
import { ClassContentFactory } from "./factories/classContentFactory"
import { ClassroomManager } from "./classroomManager"

export class SmartContractManager {
    private static readonly USE_LOCAL_DATA: boolean = true
    static blockchain: BlockChain

    static Initialise(): void {
        if (SmartContractManager.blockchain === undefined || SmartContractManager.blockchain === null) {
            SmartContractManager.blockchain = new BlockChain()
        }
    }

    static ValidateClassroomGuid(_guid: string): boolean {
        return ClassroomManager.classroomConfig.classroom.guid === _guid
    }

    static async ActivateClassroom(): Promise<string> {
        if (!SmartContractManager.blockchain.userData || !SmartContractManager.blockchain.userData.userId) return ""

        if (SmartContractManager.USE_LOCAL_DATA) {
            switch (ClassroomManager.classroomConfig.classroom.location) {
                case "classroom_1": return "382c74c3-721d-4f34-80e5-57657b6cbc27"
                default: return ""
            }
        }
        else {
            //TODO: send teacher wallet address and class location
            return "NOT_IMPLEMENTED"
        }
    }

    static async DectivateClassroom(): Promise<void> {
        if (SmartContractManager.USE_LOCAL_DATA) {

        }
        else {
            //TODO
        }
    }

    static async FetchClassList(): Promise<ClassPacket[]> {
        if (SmartContractManager.USE_LOCAL_DATA) {
            switch (ClassroomManager.classroomConfig.classroom.location) {
                case "classroom_1": {
                    let classList: ClassPacket[] = []
                    classList.push({
                        id: exampleConfig.content.id,
                        name: exampleConfig.content.name,
                        description: exampleConfig.content.description
                    })
                    classList.push({
                        id: biologyConfig.content.id,
                        name: biologyConfig.content.name,
                        description: biologyConfig.content.description
                    })
                    classList.push({
                        id: frenchConfig.content.id,
                        name: frenchConfig.content.name,
                        description: frenchConfig.content.description
                    })
                    classList.push({
                        id: historyConfig.content.id,
                        name: historyConfig.content.name,
                        description: historyConfig.content.description
                    })
                    classList.push({
                        id: mathConfig.content.id,
                        name: mathConfig.content.name,
                        description: mathConfig.content.description
                    })
                    classList.push({
                        id: physicsConfig.content.id,
                        name: physicsConfig.content.name,
                        description: physicsConfig.content.description
                    })
                    return classList
                }
                default: return []
            }
        }
        else {
            //TODO
            return []
        }
    }

    static async FetchClassContent(_id: string): Promise<ClassContent> {
        if (SmartContractManager.USE_LOCAL_DATA) {
            let contentJson: string = ""
            switch (_id) {
                case exampleConfig.content.id: contentJson = JSON.stringify(exampleConfig.content)
                    break
                case biologyConfig.content.id: contentJson = JSON.stringify(biologyConfig.content)
                    break
                case frenchConfig.content.id: contentJson = JSON.stringify(frenchConfig.content)
                    break
                case historyConfig.content.id: contentJson = JSON.stringify(historyConfig.content)
                    break
                case mathConfig.content.id: contentJson = JSON.stringify(mathConfig.content)
                    break
                case physicsConfig.content.id: contentJson = JSON.stringify(physicsConfig.content)
                    break
            }
            return ClassContentFactory.Create(contentJson)
        }
        else {
            //TODO
            return new ClassContent()
        }
    }

    static async StartClass(): Promise<void> {
        if (SmartContractManager.USE_LOCAL_DATA) {

        }
        else {
            SmartContractManager.blockchain.startClass()
        }
    }

    static async EndClass(): Promise<void> {
        if (SmartContractManager.USE_LOCAL_DATA) {
        }
        else {
            //TODO
        }
    }
}