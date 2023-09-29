import { TeacherClassroom, StudentClassroom } from "../classroom"

export abstract class ClassController {
    inSession: boolean = false
    classList: (TeacherClassroom | StudentClassroom)[] = []
    selectedClassIndex: number = 0

    constructor() {

    }

    isTeacher(): boolean {
        return false
    }

    isStudent(): boolean {
        return false
    }

    isInClass(): boolean {
        return false
    }

    activateClassroom(): void { }
    deactivateClassroom(): void { }
    setClassroom(): void { }
    fetchClassroomContent(): void { }
    startClass(): void { }
    endClass(): void { }
    joinClass(): void { }
    exitClass(): void { }
}