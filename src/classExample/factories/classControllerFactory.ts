import { ClassController } from "../classroomControllers/classController";
import { StudentClassController } from "../classroomControllers/studentClassController";
import { TeacherClassController } from "../classroomControllers/teacherClassController";

export enum ClassControllerType {
    TEACHER,
    STUDENT
}

export abstract class ClassControllerFactory {
    static Create(type: ClassControllerType) : ClassController {
        switch(type) {
            case ClassControllerType.TEACHER: return new TeacherClassController()
            case ClassControllerType.STUDENT: return new StudentClassController()
            default: return null
        }
    }
}