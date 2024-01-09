import { ClassContentPacket, ClassPacket, ContentUnitPacket, DataPacket, ServerParams, StudentCommInfo, StudentDataPacket, ClassroomSharePacket } from "../types/classroomTypes";
import { ReferenceServerWebsocketManager } from "../websocket/ReferenceServerWebsocketManager";
import { IServerChannel } from "./IServerChannel";

export class DefaultServerChannel implements IServerChannel {

    public static referenceServer: ReferenceServerWebsocketManager
    public static role: string
    public static serverUrl: string
    public static wallet: string
    public static websocket: boolean = false

    emitClassStart(_info: ClassPacket) {
        DefaultServerChannel.referenceServer.sendCommand("message", "student", "start_class", _info, "teacher")
    }
    emitClassEnd(_info: ClassPacket) {
        DefaultServerChannel.referenceServer.sendCommand("message", "student", "end_class", _info, "teacher")
    }
    emitClassJoin(_info: StudentCommInfo) {
        DefaultServerChannel.referenceServer.sendCommand("message", "teacher", "join_class", _info, "student")
    }
    emitClassExit(_info: StudentCommInfo) {
        DefaultServerChannel.referenceServer.sendCommand("message", "teacher", "exit_class", _info, "student")
    }
    emitClassroomConfig(_info: ClassroomSharePacket) {
        DefaultServerChannel.referenceServer.sendCommand("message", "student", "share_classroom_config", _info, "teacher")
    }
    emitImageDisplay(_info: ClassContentPacket) {
        DefaultServerChannel.referenceServer.sendCommand("message", "student", "display_image", _info, "teacher")
    }
    emitVideoPlay(_info: ClassContentPacket) {
        DefaultServerChannel.referenceServer.sendCommand("message", "student", "play_video", _info, "teacher")
    }
    emitVideoPause(_info: ClassContentPacket) {
        DefaultServerChannel.referenceServer.sendCommand("message", "student", "pause_video", _info, "teacher")
    }
    emitVideoResume(_info: ClassContentPacket): void {
        DefaultServerChannel.referenceServer.sendCommand("message", "student", "resume_video", _info, "teacher")
    }
    emitVideoVolume(_info: ClassContentPacket) {
        DefaultServerChannel.referenceServer.sendCommand("message", "student", "set_video_volume", _info, "teacher")
    }
    emitModelPlay(_info: ClassContentPacket): void {
        DefaultServerChannel.referenceServer.sendCommand("message", "student", "play_model", _info, "teacher")
    }
    emitModelPause(_info: ClassContentPacket): void {
        DefaultServerChannel.referenceServer.sendCommand("message", "student", "pause_model", _info, "teacher")
    }
    emitModelResume(_info: ClassContentPacket): void {
        DefaultServerChannel.referenceServer.sendCommand("message", "student", "resume_model", _info, "teacher")
    }
    emitScreenDeactivation(_info: ClassPacket): void {
        DefaultServerChannel.referenceServer.sendCommand("message", "student", "deactivate_screens", _info, "teacher")
    }
    emitModelDeactivation(_info: ClassPacket): void {
        DefaultServerChannel.referenceServer.sendCommand("message", "student", "deactivate_models", _info, "teacher")
    }
    emitContentUnitStart(_info: ContentUnitPacket): void {
        DefaultServerChannel.referenceServer.sendCommand("message", "student", "content_unit_start", _info, "teacher")
    }
    emitContentUnitEnd(_info: ClassPacket): void {
        DefaultServerChannel.referenceServer.sendCommand("message", "student", "content_unit_end", _info, "teacher")
    }
    emitContentUnitTeacherSend(_info: DataPacket): void {
        DefaultServerChannel.referenceServer.sendCommand("message", "student", "content_unit_teacher_send", _info, "teacher")
    }
    emitContentUnitStudentSend(_info: StudentDataPacket): void {
        DefaultServerChannel.referenceServer.sendCommand("message", "teacher", "content_unit_student_send", _info, "student")
    }

    serverConfig(params: ServerParams): void {
        DefaultServerChannel.serverUrl = params.serverUrl
        DefaultServerChannel.wallet = params.wallet
        DefaultServerChannel.websocket = true
    }
}