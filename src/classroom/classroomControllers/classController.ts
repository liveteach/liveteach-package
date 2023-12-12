import { ClassPacket } from "../types/classroomTypes"

/**
 * The class controller that users interact with to select, start, end, join, or exit classes.
 */
export abstract class ClassController {
    inSession: boolean = false
    classList: ClassPacket[] = []
    selectedClassIndex: number = 0

    constructor() {

    }

    /**
    * Used for knowing if the user is a teacher.
    *
    * @returns true if the user is a teacher.
    */
    isTeacher(): boolean {
        return false
    }

    /**
    * Used for knowing if the user is a student.
    *
    * @returns true if the user is a student.
    */
    isStudent(): boolean {
        return false
    }

    /**
    * Used for knowing if the user is in an active class.
    *
    * @returns true if the user is in an active class.
    */
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