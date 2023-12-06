import { ClassContentPacket, ContentUnitPacket, ClassPacket, StudentCommInfo, DataPacket, StudentDataPacket, ClassroomSharePacket } from "../types/classroomTypes";

export interface IClassroomChannel {
    emitClassActivation(_info: ClassPacket): void;
    emitClassDeactivation(_info: ClassPacket): void;
    emitClassStart(_info: ClassPacket): void;
    emitClassEnd(_info: ClassPacket): void;
    emitClassJoin(_info: StudentCommInfo): void;
    emitClassExit(_info: StudentCommInfo): void;
    emitClassroomConfig(_info: ClassroomSharePacket): void;
    emitImageDisplay(_info: ClassContentPacket): void;
    emitVideoPlay(_info: ClassContentPacket): void;
    emitVideoPause(_info: ClassContentPacket): void;
    emitVideoResume(_info: ClassContentPacket): void;
    emitVideoVolume(_info: ClassContentPacket): void;
    emitModelPlay(_info: ClassContentPacket): void;
    emitModelPause(_info: ClassContentPacket): void;
    emitModelResume(_info: ClassContentPacket): void;
    emitScreenDeactivation(_info: ClassPacket): void;
    emitModelDeactivation(_info: ClassPacket): void;
    emitContentUnitStart(_info: ContentUnitPacket): void;
    emitContentUnitEnd(_info: ClassPacket): void;
    emitContentUnitTeacherSend(_info: DataPacket): void;
    emitContentUnitStudentSend(_info: StudentDataPacket): void;
}