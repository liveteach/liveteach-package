import { ClassContentPacket, ClassPacket, Classroom, StudentCommInfo } from "../classroomTypes";

export interface IClassroomChannel {
    emitClassActivation(_info: ClassPacket);
    emitClassDeactivation(_info: ClassPacket);
    emitClassStart(_info: ClassPacket);
    emitClassEnd(_info: ClassPacket);
    emitClassJoin(_info: StudentCommInfo);
    emitClassExit(_info: StudentCommInfo);
    emitClassroomConfig(_info: Classroom);
    emitImageDisplay(_info: ClassContentPacket);
    emitVideoPlay(_info: ClassContentPacket);
    emitVideoPause(_info: ClassContentPacket);
    emitVideoVolume(_info: ClassContentPacket);
    emitModelDisplay(_info: ClassContentPacket);
}