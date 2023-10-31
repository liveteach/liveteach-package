export type ContentImage = {
    src: string
    caption: string
}

export type VideoSettings = {
    playing: boolean
    position: number
    volume: number
}
export type ContentVideo = {
    src: string
    caption: string
} & VideoSettings

export type ModelAnimation = {
    clip: string
    loop: boolean
}

export type ContentModel = {
    src: string
    animations: ModelAnimation[]
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

export type ClassContentPacket = ClassPacket & {
    image?: ContentImage,
    video?: ContentVideo,
    model?: ContentModel
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
    images: ContentImage[]
    videos: ContentVideo[]
    models: ContentModel[]
}