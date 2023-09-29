import { MessageBus } from "@dcl/sdk/message-bus";
import { UserType } from "../enums";
import { getUserData } from "~system/UserIdentity";
import { GlobalData } from "../setup/setup";

export class User {

    userType: UserType = UserType.none
    userID: string = ""
    userName: string = ""

    constructor(){
    }

}

export class UserManager {

    static userMessageBus = new MessageBus()
    static updateTime: number = 1
    static currentUpdateInterval: number = 0
    static myself : User
    static otherUsers: User[] = [] 

    constructor(){

        UserManager.myself = new User()
        
        GlobalData.executeTask(async () => { 
            let userData = await getUserData({})
            UserManager.myself.userID = userData.data?.publicKey
            UserManager.myself.userName = userData.data.displayName

    
            GlobalData.engine.addSystem(this.update)
        })


    }

    
    update(_dt){
        UserManager.currentUpdateInterval += _dt

        if (UserManager.currentUpdateInterval >= UserManager.updateTime) {
            UserManager.currentUpdateInterval = 0

            // Brodcast my data to everyone
            UserManager.userMessageBus.emit("UserData", { userType: UserManager.myself.userType,
                                                          userID: UserManager.myself.userID,
                                                          userName: UserManager.myself.userName})

            // Store other user data
            UserManager.userMessageBus.on("UserData", (data:any) => {

                if(data.userID == UserManager.myself.userID){
                    // Ignore any messages from myself
                    return
                }

                let foundUser: boolean = false
                UserManager.otherUsers.forEach(user => {
                    if(user.userID == data.userID){
                        foundUser = true
                    }
                });
                if(!foundUser){
                    let newUser = new User()
                    newUser.userType = data.userType
                    newUser.userID = data.userID
                    newUser.userName = data.userName
                    UserManager.otherUsers.push(newUser)
                }
            })  
        }

        // Every so often we will need to check if all these users are still in the scene and if not, remove them.
        // Todo
    }
}