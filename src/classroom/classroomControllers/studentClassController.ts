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

    override isTeacher(): boolean {
        return false
    }

    override isStudent(): boolean {
        return true
    }

    override isInClass(): boolean {
        return (ClassroomManager.activeClassroom !== undefined && ClassroomManager.activeClassroom !== null)
    }

    override joinClass(): void {
        ClassroomManager.JoinClass()
    }

    override exitClass(): void {
        ClassroomManager.ExitClass()
    }
}