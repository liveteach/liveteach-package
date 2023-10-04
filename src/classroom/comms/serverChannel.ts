import { ClassPacket, Classroom, StudentCommInfo } from "../classroomObjects";
import { IClassroomChannel } from "./IClassroomChannel";

export class ServerChannel implements IClassroomChannel{
    emitClassActivation(_info: ClassPacket) {
        throw new Error("Method not implemented.");
    }
    emitClassDeactivation(_info: ClassPacket) {
        throw new Error("Method not implemented.");
    }
    emitClassStart(_info: ClassPacket) {
        throw new Error("Method not implemented.");
    }
    emitClassEnd(_info: ClassPacket) {
        throw new Error("Method not implemented.");
    }
    emitClassJoin(_info: StudentCommInfo) {
        throw new Error("Method not implemented.");
    }
    emitClassExit(_info: StudentCommInfo) {
        throw new Error("Method not implemented.");
    }
    emitClassroomConfig(_info: Classroom) {
        throw new Error("Method not implemented.");
    }
}