// @ts-nocheck
import { UserType } from "../../enums";
import { ClassController } from "../classroomControllers/classController";
import { StudentClassController } from "../classroomControllers/studentClassController";
import { TeacherClassController } from "../classroomControllers/teacherClassController";

export abstract class ClassControllerFactory {
    static Create(type: UserType) : ClassController {
        switch(type) {
            case UserType.teacher: return new TeacherClassController()
            case UserType.student: return new StudentClassController()
            default: return null
        }
    }
}