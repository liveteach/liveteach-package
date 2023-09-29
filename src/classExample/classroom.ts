export class TeacherClassroom {
    guid: string
    teacherID: string
    teacherName: string
    classID: string
    className: string
    capacity: number
    duration: number
    students: StudentInfo[]
}

export class StudentClassroom {
    guid: string
    teacherID: string
    teacherName: string
    classID: string
    className: string
}

export type StudentInfo = {
    studentID: string
    studentName: string
}

export type TeacherCommInfo = StudentClassroom & StudentInfo
export type StudentCommInfo = StudentClassroom