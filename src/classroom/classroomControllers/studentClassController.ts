import { ClassroomManager } from "../classroomManager";
import { ClassPacket } from "../types/classroomTypes";
import { ClassController } from "./classController";

/**
 * Class controller for students. Extends {@link ClassController | `ClassController`}.
 */
export class StudentClassController extends ClassController {
    sceneClassList: ClassPacket[] = []

    constructor() {
        super()
    }

    /**
    * Used for knowing if the user is a teacher.
    *
    * @returns false.
    */
    override isTeacher(): boolean {
        return false
    }

    /**
    * Used for knowing if the user is a student.
    *
    * @returns true.
    */
    override isStudent(): boolean {
        return true
    }

    /**
    * Used for knowing if the user is in an active class.
    *
    * @returns true if the user is in an active class.
    */
    override isInClass(): boolean {
        return (ClassroomManager.activeClassroom !== undefined && ClassroomManager.activeClassroom !== null)
    }

    /**
    * Joins a class.
    */
    override joinClass(): void {
        ClassroomManager.JoinClass()
    }

    /**
    * Exits a class.
    */
    override exitClass(): void {
        ClassroomManager.ExitClass()
    }
}