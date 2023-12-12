import { ClassController } from "./classController";
import { ClassroomManager } from "../classroomManager";

/**
 * Class controller for teachers. Extends {@link ClassController | `ClassController`}.
 */
export class TeacherClassController extends ClassController {
    constructor() {
        super()
    }

    override isTeacher(): boolean {
        return true
    }

    override isStudent(): boolean {
        return false
    }

    override isInClass(): boolean {
        return this.inSession
    }

    override setClassroom(): void {
        ClassroomManager.SetTeacherClassContent(this.classList[this.selectedClassIndex].id)
    }

    override startClass(): void {
        const self = this
        ClassroomManager.StartClass()
            .then(function () {
                self.inSession = true
            })
            .catch(function (error) {
                console.error(error)
            })
    }

    override endClass(): void {
        const self = this
        ClassroomManager.EndClass()
            .then(function () {
                self.inSession = false
            })
            .catch(function (error) {
                console.error(error)
            })
    }
}