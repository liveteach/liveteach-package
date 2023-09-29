import { ClassroomManager } from "../classroomManager";
import { ClassController } from "./classController";

export class StudentClassController extends ClassController {

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
        ClassroomManager.JoinClass(this.classList[this.selectedClassIndex])
    }

    override exitClass(): void {
        ClassroomManager.ExitClass()
    }
}