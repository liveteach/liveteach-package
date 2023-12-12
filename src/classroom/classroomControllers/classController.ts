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
    * @returns true if the user is in an active class that's in session.
    */
    isInClass(): boolean {
        return this.inSession
    }

    /**
    * Sets the selected classroom and teacher content.
    */
    setClassroom(): void { }

    /**
    * Fetches classroom content.
    */
    fetchClassroomContent(): void { }

    /**
    * Starts a class.
    */
    startClass(): void { }

    /**
    * Ends a class.
    */
    endClass(): void { }

    /**
    * Joins a class.
    */
    joinClass(): void { }

    /**
    * Exits a class.
    */
    exitClass(): void { }
}