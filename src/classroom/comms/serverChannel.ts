import { ClassContentPacket, ClassPacket, Classroom, ContentUnitPacket, DataPacket, StudentCommInfo, StudentDataPacket } from "../types/classroomTypes";
import { IClassroomChannel } from "./IClassroomChannel";
import { ReferenceServerWebsocketManager} from "../websocket/ReferenceServerWebsocketManager";
import {UserData} from "~system/UserIdentity";

export class ServerChannel implements IClassroomChannel{

    private static referenceServer:ReferenceServerWebsocketManager

    constructor(_userData: UserData, role:string,serverUrl: string) {
        ServerChannel.referenceServer = new ReferenceServerWebsocketManager(_userData, role, serverUrl);
    }

    emitClassActivation(_info: ClassPacket) {
        ServerChannel.referenceServer.sendCommand("message","student", "activate_class",_info, "teacher")
    }
    emitClassDeactivation(_info: ClassPacket) {
        ServerChannel.referenceServer.sendCommand("message","student", "deactivate_class",_info, "teacher")
    }
    emitClassStart(_info: ClassPacket) {
        ServerChannel.referenceServer.sendCommand("message","student","start_class" ,_info, "teacher")
    }
    emitClassEnd(_info: ClassPacket) {
        ServerChannel.referenceServer.sendCommand("message","student", "end_class",_info, "teacher")
    }
    emitClassJoin(_info: StudentCommInfo) {
        ServerChannel.referenceServer.sendCommand("message","teacher", "join_class",_info,"student")
    }
    emitClassExit(_info: StudentCommInfo) {
        ServerChannel.referenceServer.sendCommand("message","teacher", "exit_class",_info,"student")
    }
    emitClassroomConfig(_info: Classroom) {
        ServerChannel.referenceServer.sendCommand("message","teacher", "config_class",_info,"student")
    }
    emitImageDisplay(_info: ClassContentPacket) {
        throw new Error("Method not implemented.");
    }
    emitVideoPlay(_info: ClassContentPacket) {
        throw new Error("Method not implemented.");
    }
    emitVideoPause(_info: ClassContentPacket) {
        throw new Error("Method not implemented.");
    }
    emitVideoResume(_info: ClassContentPacket): void {
        throw new Error("Method not implemented.");
    }
    emitVideoVolume(_info: ClassContentPacket) {
        throw new Error("Method not implemented.");
    }
    emitModelPlay(_info: ClassContentPacket): void {
        throw new Error("Method not implemented.");
    }
    emitModelPause(_info: ClassContentPacket): void {
        throw new Error("Method not implemented.");
    }
    emitModelResume(_info: ClassContentPacket): void {
        throw new Error("Method not implemented.");
    }
    emitScreenDeactivation(_info: ClassPacket): void {
        throw new Error("Method not implemented.");
    }
    emitModelDeactivation(_info: ClassPacket): void {
        throw new Error("Method not implemented.");
    }
    emitContentUnitStart(_info: ContentUnitPacket): void {
        throw new Error("Method not implemented.");
    }
    emitContentUnitEnd(_info: ClassPacket): void {
        throw new Error("Method not implemented.");
    }
    emitContentUnitTeacherSend(_info: DataPacket): void {
        throw new Error("Method not implemented.");
    }
    emitContentUnitStudentSend(_info: StudentDataPacket): void {
        throw new Error("Method not implemented.");
    }
}