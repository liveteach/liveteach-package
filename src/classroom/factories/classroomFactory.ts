import { UserDataHelper } from "../userDataHelper";
import { Classroom } from "../types/classroomTypes";

export abstract class ClassroomFactory {
    static CreateTeacherClassroom(_config: string, _className: string, _classDescription: string) : Classroom {
        let classroom: Classroom = Object.assign(new Classroom(), JSON.parse(_config))
        classroom.teacherID = UserDataHelper.GetUserId()
        classroom.teacherName = UserDataHelper.GetDisplayName()
        classroom.className = _className
        classroom.classDescription = _classDescription
        return classroom
    }

    static CreateStudentClassroom(_info: Classroom) : Classroom {
        let classroom = new Classroom()
        classroom.guid = _info.guid ?? ""
        classroom.teacherID = _info.teacherID ?? ""
        classroom.teacherName = _info.teacherName ?? ""
        classroom.className = _info.className ?? ""
        return classroom
    }
}