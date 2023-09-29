import { SmartContractManager } from "./smartContractManager";

export abstract class ClassMemberData {
    static GetUserId() : string {
        if(SmartContractManager.blockchain && SmartContractManager.blockchain.userData) {
            return SmartContractManager.blockchain.userData.userId
        }
        else {
            console.error("Tried getting user ID. UserData is not available.")
            return ""
        }
    }

    static GetDisplayName() : string {
        if(SmartContractManager.blockchain && SmartContractManager.blockchain.userData) {
            return SmartContractManager.blockchain.userData.displayName
        }
        else {
            console.error("Tried getting display name. UserData is not available.")
            return ""
        }
    }
}