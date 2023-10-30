import { ClassContentPacket, ClassPacket, Classroom, StudentCommInfo } from "../classroomObjects";
import { IClassroomChannel } from "./IClassroomChannel";
import { ReferenceServerWebsocketManager} from "../websocket/ReferenceServerWebsocketManager";
import {UserData} from "~system/UserIdentity";

export class ServerChannel implements IClassroomChannel{

    private static referenceServer:ReferenceServerWebsocketManager

    constructor(_userData: UserData, role:string,serverUrl: string) {
        ServerChannel.referenceServer = new ReferenceServerWebsocketManager(_userData, role, serverUrl);
    }

    emitClassActivation(_info: ClassPacket) {
        ServerChannel.referenceServer.sendCommand("message","student",_info.toString(), "teacher")
    }
    emitClassDeactivation(_info: ClassPacket) {
        ServerChannel.referenceServer.sendCommand("message","student",_info.toString(), "teacher")
    }
    emitClassStart(_info: ClassPacket) {
        ServerChannel.referenceServer.sendCommand("message","student",_info.toString(), "teacher")
    }
    emitClassEnd(_info: ClassPacket) {
        ServerChannel.referenceServer.sendCommand("message","student",_info.toString(), "teacher")
    }
    emitClassJoin(_info: StudentCommInfo) {
        ServerChannel.referenceServer.sendCommand("message","teacher",_info.toString(),"student")
    }
    emitClassExit(_info: StudentCommInfo) {
        ServerChannel.referenceServer.sendCommand("message","teacher",_info.toString(),"student")
    }
    emitClassroomConfig(_info: Classroom) {
        ServerChannel.referenceServer.sendCommand("message","teacher",_info.toString(),"student")
    }
    emitImageDisplay(_info: ClassContentPacket) {
        throw new Error("Method not implemented.");
    }
    emitVideoDisplay(_info: ClassContentPacket) {
        throw new Error("Method not implemented.");
    }
    emitModelDisplay(_info: ClassContentPacket) {
        throw new Error("Method not implemented.");
    }
}