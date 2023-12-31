import { ClassPacket } from "../types/classroomTypes"

export abstract class ClassController {
    inSession: boolean = false
    classList: ClassPacket[] = []
    selectedClassIndex: number = 0

    constructor() {

    }

    isTeacher(): boolean {
        return false
    }

    isStudent(): boolean {
        return false
    }

    isInClass(): boolean {
        return this.inSession
    }

    setClassroom(): void { }
    fetchClassroomContent(): void { }
    startClass(): void { }
    endClass(): void { }
    joinClass(): void { }
    exitClass(): void { }
}