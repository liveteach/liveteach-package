import { ClassContentPacket, ClassPacket, Classroom, StudentCommInfo } from "../types/classroomTypes";

export interface IClassroomChannel {
    emitClassActivation(_info: ClassPacket):void;
    emitClassDeactivation(_info: ClassPacket):void;
    emitClassStart(_info: ClassPacket):void;
    emitClassEnd(_info: ClassPacket):void;
    emitClassJoin(_info: StudentCommInfo):void;
    emitClassExit(_info: StudentCommInfo):void;
    emitClassroomConfig(_info: Classroom):void;
    emitImageDisplay(_info: ClassContentPacket):void;
    emitVideoPlay(_info: ClassContentPacket):void;
    emitVideoPause(_info: ClassContentPacket):void;
    emitVideoVolume(_info: ClassContentPacket):void;
    emitModelDisplay(_info: ClassContentPacket):void;
}