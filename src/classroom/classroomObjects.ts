export type contentImage = {
    src: string
    caption: string
}

export type contentVideo = {
    src: string
    caption: string
}

export type contentModel = {
    key: string
}

export type StudentInfo = {
    studentID: string
    studentName: string
}

export type ClassPacket = {
    id: string,
    name: string,
    description: string
}

export type StudentCommInfo = ClassPacket & StudentInfo

export class Classroom {
    guid: string
    teacherID: string
    teacherName: string
    className: string
    classDescription: string
    location: string
    capacity: number
    duration: number
    seatingEnabled: boolean
    videoPlaying: boolean
    skybox: string
    displayedImage: string
    displayedVideo: string
    displayedModels: string[]
    students: StudentInfo[]
}

export class ClassContent {
    id: string
    name: string
    description: string
    images: contentImage[]
    videos: contentVideo[]
    models: contentModel[]
}