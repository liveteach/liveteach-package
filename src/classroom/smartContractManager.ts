import { ClassroomFactory } from "./factories/classroomFactory"
import { TeacherClassroom } from "./classroom"
import { BlockChain } from "./blockchain"
import * as biologyConfig from "./classroomConfigs/biologyConfig.json"
import * as frenchConfig from "./classroomConfigs/frenchConfig.json"
import * as historyConfig from "./classroomConfigs/historyConfig.json"
import * as mathConfig from "./classroomConfigs/mathConfig.json"
import * as physicsConfig from "./classroomConfigs/physicsConfig.json"

export class SmartContractManager {
    private static readonly USE_LOCAL_DATA: boolean = true
    static blockchain: BlockChain

    static Initialise(): void {
        if (SmartContractManager.blockchain === undefined || SmartContractManager.blockchain === null) {
            SmartContractManager.blockchain = new BlockChain()
        }
    }

    static async ActivateClassroom(_location: string): Promise<string> {
        if (!SmartContractManager.blockchain.userData || !SmartContractManager.blockchain.userData.userId) return ""

        if (SmartContractManager.USE_LOCAL_DATA) {
            return SmartContractManager.blockchain.userData.userId // Use the teacher's userId as the classroom guid
        }
        else {
            //TODO
            return "NOT_IMPLEMENTED"
        }
    }

    static async DectivateClassroom(_location: string): Promise<void> {
        if (SmartContractManager.USE_LOCAL_DATA) {

        }
        else {
            //TODO
        }
    }

    static async FetchClassContent(_guid: string): Promise<TeacherClassroom[]> {
        if (SmartContractManager.USE_LOCAL_DATA) {
            const biologyContent = ClassroomFactory.CreateTeacherClassrom(JSON.stringify(biologyConfig.classroom), _guid)
            const frenchContent = ClassroomFactory.CreateTeacherClassrom(JSON.stringify(frenchConfig.classroom), _guid)
            const historyContent = ClassroomFactory.CreateTeacherClassrom(JSON.stringify(historyConfig.classroom), _guid)
            const mathContent = ClassroomFactory.CreateTeacherClassrom(JSON.stringify(mathConfig.classroom), _guid)
            const physicsContent = ClassroomFactory.CreateTeacherClassrom(JSON.stringify(physicsConfig.classroom), _guid)
            return [biologyContent, frenchContent, historyContent, mathContent, physicsContent]
        }
        else {
            //TODO
            return []
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