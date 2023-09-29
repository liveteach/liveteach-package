import { ClassMemberData } from "../classMemberData";
import { TeacherClassroom, StudentClassroom } from "../classroom";

export abstract class ClassroomFactory {
    static CreateTeacherClassrom(_config: string, _guid) : TeacherClassroom {
        let classroom: TeacherClassroom = Object.assign(new TeacherClassroom(), JSON.parse(_config))
        classroom.guid = _guid
        classroom.teacherID = ClassMemberData.GetUserId()
        classroom.teacherName = ClassMemberData.GetDisplayName()
        classroom.students = []
        return classroom
    }

    static CreateStudentClassroom(_info: StudentClassroom) : StudentClassroom {
        let classroom = new StudentClassroom()
        classroom.teacherID = _info.teacherID ?? ""
        classroom.teacherName = _info.teacherName ?? ""
        classroom.classID = _info.classID ?? ""
        classroom.className = _info.className ?? ""
        return classroom
    }
}