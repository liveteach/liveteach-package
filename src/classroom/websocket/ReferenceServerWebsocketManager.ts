// @ts-nocheck
import {UserData} from "~system/UserIdentity"
import {GetCurrentRealmResponse} from "~system/EnvironmentApi";
import * as ui from 'dcl-ui-toolkit'
import * as utils from '@dcl-sdk/utils'
import {CommunicationManager} from "../comms/communicationManager";
import {ClassContent, ClassContentPacket, ClassPacket, Classroom, ClassroomSharePacket, ContentUnitPacket, DataPacket, StudentCommInfo, StudentDataPacket, StudentInfo} from "../types/classroomTypes";


export class ReferenceServerWebsocketManager {

    private serverUrl: string
    private static realm: GetCurrentRealmResponse | null = null
    private wallet: string
    public webSocket: WebSocket
    public announcement = ui.createComponent(ui.Announcement, { value: "", duration: 2 })
    public static guid

    constructor(role:string,serverUrl: string) {

        this.serverUrl = serverUrl
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


    public sendCommand(_type: string, topic: string, message: string, payload: object, from:string) {
        this.webSocket.send(this.getWebSocketMessage(_type, topic, message, payload,from))
    }


    public executeNext(message: any) {
        console.log("new-ws-message : " + JSON.stringify(message))
        console.log(ReferenceServerWebsocketManager.guid)
        switch (message.type) {
            case "guid":
                ReferenceServerWebsocketManager.guid = message.data
                this.showMessage(message)
                this.subscribeToTopic(message.data) // this will error with the java implementation best to comment out
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
            case "display_image":
                CommunicationManager.OnImageDisplay(this.classContentPacket(message))
                break;
            case "play_video":
                CommunicationManager.OnVideoPlay(this.classContentPacket(message))
                break;
            case "pause_video":
                CommunicationManager.OnVideoPause(this.classPacket(message))
                break;
            case "resume_video":
                CommunicationManager.OnVideoResume(this.classPacket(message))
                break;
            case "set_video_volume":
                CommunicationManager.OnVideoVolume(this.classPacket(message) + message.volume)
                break;
            case "play_model":
                CommunicationManager.OnModelPlay(this.classContentPacket(message))
                break;
            case "pause_model":
                CommunicationManager.OnModelPause(this.classPacket(message))
                break;
            case "resume_model":
                CommunicationManager.OnModelResume(this.classPacket(message))
                break;
            case "deactivate_screens":
                CommunicationManager.OnScreenDeactivation(this.classPacket(message))
                break;
            case "deactivate_models":
                CommunicationManager.OnModelDeactivation(this.classPacket(message))
                break;
            case "content_unit_start":
                CommunicationManager.OnContentUnitStart(this.contentPacket(message))
                break;
            case "content_unit_end":
                CommunicationManager.OnContentUnitEnd(this.classPacket(message))
                break;
            case "content_unit_teacher_send":
                CommunicationManager.OnContentUnitTeacherSend(this.dataPacket(message))
                break;
            case "content_unit_student_send":
                CommunicationManager.OnContentUnitStudentSend(this.studentDataPacket(message))
                break;
            case "share_classroom_config":
                CommunicationManager.OnShareClassroomConfig(this.classShareConfig(message))
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

    getWebSocketMessage(_type: string, topic: string, message: string, payload: object, from:string): string {

        let msg = {
            "header": {
                "type": _type,
                "timestamp": new Date().toISOString()
            },
            "body": {
                "topic": topic,
                "message": message,
                "payload": payload,
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

    classContentPacket(message): ClassContentPacket{
        return{
            id: message.data.id,
            name: message.data.name,
            description: message.data.description,
            unit: message.data.unit,
            image: message.data.image || "",
            video: message.data.video || "",
            model: message.data.model || ""
        }
    }

    contentPacket(message): ContentUnitPacket{
        return {
            id: message.data.id,
            name: message.data.name,
            description: message.data.description,
            unit: message.data.unit
        }
    }

    dataPacket(message): DataPacket{
        return {
            id: message.data.id,
            name: message.data.name,
            description: message.data.description,
            data: message.data.data
        }
    }

    studentDataPacket(message): StudentDataPacket{
        return {
            id: message.data.id,
            name: message.data.name,
            description: message.data.description,
            studentID: message.data.studentID,
            studentName: message.data.studentName,
            data: message.data.data
        }
    }


    classShareConfig(message): ClassroomSharePacket{
        return {
            config: message.data.config,
            content: message.data.content
        }
    }
}