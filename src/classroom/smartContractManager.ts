import { ClassContent, ClassPacket } from "./types/classroomTypes"
import { BlockChain } from "./blockchain"
import { ClassContentFactory } from "./factories/classContentFactory"
import { ClassroomManager } from "./classroomManager"
import { engine, executeTask } from "@dcl/sdk/ecs"
import { UserType } from "../enums"
import * as exampleConfig from "../classroomContent/liveTeachConfigs/exampleConfig.json"
import { StudentClassController } from "./classroomControllers/studentClassController"

export class SmartContractManager {
    private static TEST_CONTRACT_GUID: string = "382c74c3-721d-4f34-80e5-57657b6cbc27"
    private static TEST_TEACHER_ADDRESSES: string[] = [
        "0xe5cf1BB88a59F9fC609689C681D1d14bfE7Ce73A",
        "0xbEA7Ad6cdb932fD81EB386cc9BD21E426b99cB37",
        "0x5c71B8C74aD58Ce25bD5BD771dFCE14c54ef1738"
    ]

    private static contractGuidFetched: boolean = false
    static contractGuid: string = ""
    static blockchain: BlockChain

    static Initialise(liveTeachContractAddress?: string, teachersContractAddress?: string): void {
        if (SmartContractManager.blockchain === undefined || SmartContractManager.blockchain === null) {
            SmartContractManager.blockchain = new BlockChain(liveTeachContractAddress, teachersContractAddress)
        }

        SmartContractManager.GetClassroomGuid()
        engine.addSystem(SmartContractManager.update)
    }

    static SetTestContractGuid(_guid: string): void {
        SmartContractManager.TEST_CONTRACT_GUID = _guid
    }

    static AddTestTeacherAddress(_address: string): void {
        SmartContractManager.TEST_TEACHER_ADDRESSES.push(_address)
    }

    static async GetClassroomGuid(): Promise<string> {
        if (!SmartContractManager.blockchain.userData || !SmartContractManager.blockchain.userData.userId) return ""

        if (ClassroomManager.testMode) {
            let authorized: boolean = false
            for (let address of SmartContractManager.TEST_TEACHER_ADDRESSES) {
                if (address.toLowerCase() == SmartContractManager.blockchain.userData.userId.toLowerCase()) {
                    authorized = true
                    break
                }
            }
            return authorized ? SmartContractManager.TEST_CONTRACT_GUID : ""
        }
        else {
            return SmartContractManager.blockchain.getClassroomGuid(SmartContractManager.blockchain.getBaseParcel())
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

    private static update(): void {
        if (!SmartContractManager.contractGuidFetched) {
            if (SmartContractManager.blockchain.userData && SmartContractManager.blockchain.userData.userId
                && SmartContractManager.blockchain.sceneBaseX <= 500 && SmartContractManager.blockchain.sceneBaseZ <= 500) {

                // Ready to fetch contract guid
                SmartContractManager.contractGuidFetched = true
                executeTask(async () => {
                    SmartContractManager.GetClassroomGuid().then(
                        function (classroomGuid: string) {
                            SmartContractManager.contractGuid = classroomGuid
                        }
                    )
                })
            }
        }

        // Check if we have a class controller set up
        if (!ClassroomManager.classController) return

        // Try to get a classroom config
        const config = ClassroomManager.GetClassroomConfig()

        // If we were able to fetch a config, it means we're inside a classroom (inside its defined volume)
        if (config) {
            // Should be a teacher
            if (SmartContractManager.contractGuid.length > 0 && config.classroom.guid === SmartContractManager.contractGuid) {
                if (ClassroomManager.classController.isTeacher()) return

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
            // Should be a student
            else {
                if (!ClassroomManager.classController.isStudent()) {
                    ClassroomManager.SetClassController(UserType.student)
                }

                // If the student is already in a class, do nothing else
                if (ClassroomManager.activeClassroom) return

                // Update the student's list of joinable classrooms. Note that the student can only be in 1 classroom volume at a time, i.e. only 1 class can be on that list at any time
                let studentClassController = ClassroomManager.classController as StudentClassController
                studentClassController.classList.splice(0)

                studentClassController.selectedClassIndex = 0
                for (let i = 0; i < studentClassController.sceneClassList.length; i++) {
                    if (studentClassController.sceneClassList[i].id == config.classroom.guid) {
                        studentClassController.classList.push(studentClassController.sceneClassList[i])
                        break
                    }
                }

                if (studentClassController.classList.length > 0) {
                    // At this point, it means we're a student in a classroom volume, and that class is currently being taught

                    //autojoin
                    if (config.classroom.autojoin) {
                        ClassroomManager.JoinClass()
                    }
                }
            }
        }
        else {
            if (ClassroomManager.classController.isTeacher()) {
                ClassroomManager.SetClassController(UserType.student)
            }
            else {
                // If they were joined in a class, leave it
                if (ClassroomManager.activeClassroom && ClassroomManager.classController.inSession) {
                    ClassroomManager.ExitClass()
                }
            }
        }
    }
}