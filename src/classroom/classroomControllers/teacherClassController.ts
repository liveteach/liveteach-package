import { ClassController } from "./classController";
import { ClassroomManager } from "../classroomManager";

/**
 * Class controller for teachers. Extends {@link ClassController | `ClassController`}.
 */
export class TeacherClassController extends ClassController {
    constructor() {
        super()
    }

    /**
    * Used for knowing if the user is a teacher.
    *
    * @returns true.
    */
    override isTeacher(): boolean {
        return true
    }

    /**
    * Used for knowing if the user is a student.
    *
    * @returns false.
    */
    override isStudent(): boolean {
        return false
    }

    /**
    * Sets the selected classroom and teacher content.
    */
    override setClassroom(): void {
        ClassroomManager.SetTeacherClassContent(this.classList[this.selectedClassIndex].contentUrl ?? "")
    }

    /**
    * Starts a class.
    */
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

    /**
    * Ends a class.
    */
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