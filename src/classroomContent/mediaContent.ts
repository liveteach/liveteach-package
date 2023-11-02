import { MediaContentType } from "./enums"
import { IMediaContent } from "./interfaces/IMediaContent"
import { MediaContentConfig } from "./types/mediaContentConfigs"

export abstract class MediaContent implements IMediaContent {
    configuration: MediaContentConfig
    isShowing: boolean = false
    isPaused: boolean = false

    constructor(_config: MediaContentConfig) {
        this.configuration = _config
    }

    play(): void {
        this.isShowing = true
        this.isPaused = false
    }

    stop(): void {
        this.isShowing = false
        this.isPaused = false
    }

    resume(): void {
        this.isShowing = true
        this.isPaused = false
    }

    pause(): void {
        this.isShowing = true
        this.isPaused = true
    }

    getContentType(): MediaContentType {
        return MediaContentType.none
    }

    abstract update(_dt: number): void

}