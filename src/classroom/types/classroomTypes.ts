import { ImageContentConfig, ModelContentConfig, VideoContentConfig } from "../../ClasstoomContent/types/mediaContentConfigs"

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
    image?: ImageContentConfig,
    video?: VideoContentConfig,
    model?: ModelContentConfig
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
    images: ImageContentConfig[]
    videos: VideoContentConfig[]
    models: ModelContentConfig[]
}