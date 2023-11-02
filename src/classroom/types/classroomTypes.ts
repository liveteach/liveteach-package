import { Vector3 } from "@dcl/sdk/math"
import { ImageContentConfig, ModelContentConfig, VideoContentConfig } from "../../classroomContent"

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
    origin: Vector3
    volume: Vector3
    capacity: number
    duration: number
    seatingEnabled: boolean
    videoPlaying: boolean
    skybox: string
    displayedImage: ImageContentConfig
    displayedVideo: VideoContentConfig
    displayedModel: ModelContentConfig
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