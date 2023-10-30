import { ClassContentPacket, ClassPacket, Classroom, StudentCommInfo } from "../classroomObjects";

export interface IClassroomChannel {
    emitClassActivation(_info: ClassPacket);
    emitClassDeactivation(_info: ClassPacket);
    emitClassStart(_info: ClassPacket);
    emitClassEnd(_info: ClassPacket);
    emitClassJoin(_info: StudentCommInfo);
    emitClassExit(_info: StudentCommInfo);
    emitClassroomConfig(_info: Classroom);
    emitImageDisplay(_info: ClassContentPacket);
    emitVideoDisplay(_info: ClassContentPacket);
    emitModelDisplay(_info: ClassContentPacket);
}