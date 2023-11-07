import { ClassContentPacket, ClassPacket, Classroom, StudentCommInfo } from "../types/classroomTypes";
import { IClassroomChannel } from "./IClassroomChannel";
import { CommunicationManager } from "./communicationManager";

export class PeerToPeerChannel implements IClassroomChannel{
    emitClassActivation(_info: ClassPacket) {
        CommunicationManager.messageBus.emit('activate_class', _info)
    }
    emitClassDeactivation(_info: ClassPacket) {
        CommunicationManager.messageBus.emit('deactivate_class', _info)
    }
    emitClassStart(_info: ClassPacket) {
        CommunicationManager.messageBus.emit('start_class', _info)
    }
    emitClassEnd(_info: ClassPacket) {
        CommunicationManager.messageBus.emit('end_class', _info)
    }
    emitClassJoin(_info: StudentCommInfo) {
        CommunicationManager.messageBus.emit('join_class', _info)
    }
    emitClassExit(_info: StudentCommInfo) {
        CommunicationManager.messageBus.emit('exit_class', _info)
    }
    emitClassroomConfig(_info: Classroom) {
        CommunicationManager.messageBus.emit('share_classroom_config', _info)
    }
    emitImageDisplay(_info: ClassContentPacket) {
        CommunicationManager.messageBus.emit('display_image', _info)
    }
    emitVideoPlay(_info: ClassContentPacket) {
        CommunicationManager.messageBus.emit('play_video', _info)
    }
    emitVideoPause(_info: ClassContentPacket) {
        CommunicationManager.messageBus.emit('pause_video', _info)
    }
    emitVideoResume(_info: ClassContentPacket): void {
        CommunicationManager.messageBus.emit('resume_video', _info)
    }
    emitVideoVolume(_info: ClassContentPacket) {
        CommunicationManager.messageBus.emit('set_video_volume', _info)
    }
    emitModelPlay(_info: ClassContentPacket): void {
        CommunicationManager.messageBus.emit('play_model', _info)
    }
    emitModelPause(_info: ClassContentPacket): void {
        CommunicationManager.messageBus.emit('pause_model', _info)
    }
    emitModelResume(_info: ClassContentPacket): void {
        CommunicationManager.messageBus.emit('resume_model', _info)
    }
    emitScreenDeactivation(_info: ClassPacket): void {
        CommunicationManager.messageBus.emit('deactivate_screens', _info)
    }
    emitModelDeactivation(_info: ClassPacket): void {
        CommunicationManager.messageBus.emit('deactivate_models', _info)
    }
}