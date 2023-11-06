import { Entity } from "@dcl/ecs"
import { Quaternion, Vector3 } from "@dcl/sdk/math"

export type BaseContentConfig = {
    src: string
    caption?: string
}

export type ScreenContentConfig = BaseContentConfig & {
    ratio?: number
}

export type ImageContentConfig = ScreenContentConfig

export type VideoContentConfig = ScreenContentConfig & {
    playing?: boolean
    position?: number
    volume?: number
}

export type ModelContentConfig = BaseContentConfig & {
    animations: ModelAnimation[]
    parent?: Entity
    position: Vector3 // relative to the classroom base position
    rotation?: Quaternion
    scale?: Vector3
    spin?: boolean
    replace?: boolean
}

export type MediaContentConfig = ImageContentConfig | VideoContentConfig | ModelContentConfig

export type ModelAnimation = {
    clip: string
    loop?: boolean
}