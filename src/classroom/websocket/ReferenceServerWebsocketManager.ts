import {UserData} from "~system/UserIdentity"
import {GetCurrentRealmResponse} from "~system/EnvironmentApi";
import * as ui from 'dcl-ui-toolkit'
import * as utils from '@dcl-sdk/utils'
import {CommunicationManager} from "../comms/communicationManager";
import {ClassPacket, StudentCommInfo, StudentInfo} from "../classroomTypes";

export class ReferenceServerWebsocketManager {

    private serverUrl: string
    private static realm: GetCurrentRealmResponse | null = null
    private user: UserData
    private wallet: string
    public webSocket: WebSocket
    public announcement = ui.createComponent(ui.Announcement, { value: "", duration: 2 })
    public static guid

    constructor(_userData: UserData, role:string,serverUrl: string) {

        this.serverUrl = serverUrl
        this.user = _userData
        this.wallet = this.user.publicKey || "GUEST_" + this.user.userId

        this.webSocket = new WebSocket(this.serverUrl)

        this.webSocket.onopen = (event) => {

            this.webSocket.send(JSON.stringify({
                "header": {
                    "type": "SUBSCRIBE",
                    "timestamp": new Date().toISOString()
                },
                "body": {
                    "topic": role  // this value will need to be injected depending on the users status "student" or "teacher"
                }
            }))
            console.log("web-socket open?  " + event.type)
        };

        this.webSocket.onmessage = (event) => {
            let message = JSON.parse(event.data)
            console.log("websocket-message : " + event.data)
            this.executeNext(message)
        };

        this.webSocket.onerror = (event) => {
            console.log('web-socket error:', event);
        };

        this.webSocket.onclose = (event) => {
            console.log('web-socket connection closed.');
        };
    }


    public sendCommand(_type: string, topic: string, message: string, from:string) {
        this.webSocket.send(this.getWebSocketMessage(_type, topic, message,from))
    }


    public executeNext(message: any) {
        console.log("new-ws-message : " + JSON.stringify(message))
        switch (message.type) {
            case "guid":
                ReferenceServerWebsocketManager.guid = message.data
                this.showMessage(message)
                this.subscribeToTopic(message.data) // this will error with the java implementation best to comment out
                break;
            case "activate_class":
                CommunicationManager.OnActivateClass(this.classPacket(message))
                break;
            case "deactivate_class":
                CommunicationManager.OnDeactivateClass(this.classPacket(message))
                break;
            case "start_class":
                CommunicationManager.OnStartClass(this.classPacket(message))
                break;
            case "end_class":
                CommunicationManager.OnEndClass(this.classPacket(message))
                break;
            case "join_class":
                CommunicationManager.OnJoinClass(this.studentInfo(message))
                break;
            case "exit_class":
                CommunicationManager.OnExitClass(this.studentInfo(message))
                break;
            case "sync":
                console.log(message)
                break;
        }
    }

    showMessage(msg: string){
        this.announcement.value = JSON.stringify(msg)
        this.announcement.show()
        utils.timers.setTimeout(() => {
            this.announcement.hide()
        }, 3000);
    }

    getWebSocketMessage(_type: string, topic: string, message: string, from:string): string {

        let msg = {
            "header": {
                "type": _type,
                "timestamp": new Date().toISOString()
            },
            "body": {
                "topic": topic,
                "message": message,
                "from": from,
                "guid": ReferenceServerWebsocketManager.guid,
                "wallet": this.wallet
            }
        }
        return JSON.stringify(msg)
    }

    subscribeToTopic(guid:string){
        this.webSocket.send(JSON.stringify({
            "header": {
                "type": "register",
                "timestamp": new Date().toISOString()
            },
            "body": {
                "topic": guid,
                "guid": guid,
                "wallet": this.wallet
            }
        }))
    }

    classPacket(message): ClassPacket{
        return {
            id: message.data.id,
            name: message.data.name,
            description: message.data.description,
        }
    }

    studentInfo(message): StudentCommInfo{
        return {
            id: message.data.id,
            name: message.data.name,
            description: message.data.description,
            studentID: message.data.studentID,
            studentName: message.data.name
        }
    }

}