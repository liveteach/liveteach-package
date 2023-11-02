import { ClassController } from "./classController";
import { ControllerUI } from "../ui/controllerUI";
import { ClassroomManager } from "../classroomManager";
import { ClassPacket } from "../types/classroomTypes";

export class TeacherClassController extends ClassController {
    activated: boolean = false

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
        return this.activated
    }

    override activateClassroom(): void {
        const self = this
        ClassroomManager.ActivateClassroom()
            .then(function (classList) {
                self.activated = true
                self.classList = classList as ClassPacket[]
                self.setClassroom()
                ControllerUI.activationMessage = "activated"
            })
            .catch(function (error) {
                ControllerUI.activationMessage = error.toString()
            })
    }

    override deactivateClassroom(): void {
        const self = this
        ClassroomManager.DeactivateClassroom()
            .then(function () {
                self.activated = false
                ControllerUI.activationMessage = "deactivated"
            })
            .catch(function (error) {
                ControllerUI.activationMessage = error.toString()
            })
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

            })
    }

    override endClass(): void {
        const self = this
        ClassroomManager.EndClass()
            .then(function () {
                self.inSession = false
            })
            .catch(function (error) {

            })
    }
}