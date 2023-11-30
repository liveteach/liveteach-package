// @ts-nocheck
import { Vector3 } from "@dcl/sdk/math"
import { ImageContentConfig, ModelContentConfig, VideoContentConfig } from "../../classroomContent"
import { UserData } from "~system/UserIdentity";
import { ContentUnitConfig } from "../../contentUnits"
import { MediaContentType } from "../../classroomContent/enums";

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

export type ContentUnitPacket = ClassPacket & {
    unit: ContentUnitConfig
}

export type DataPacket = ClassPacket & {
    data: any
}

export type StudentDataPacket = StudentCommInfo & DataPacket

export class Classroom {
    guid: string
    teacherID: string
    teacherName: string
    className: string
    classDescription: string
    origin: Vector3
    volume: Vector3
    autojoin: boolean
    capacity: number
    duration: number
    seatingEnabled: boolean
    students: StudentInfo[]
}

export class ClassContent {
    id: string
    name: string
    description: string
    images: ImageContentConfig[]
    videos: VideoContentConfig[]
    models: ModelContentConfig[]
    contentUnits: ContentUnitConfig[]
}

export type ClassroomSharePacket = {
    config: Classroom,
    content: ClassContent
    activeContentType: MediaContentType
}

export class ServerParams {
    serverUrl: string
    role: string
}