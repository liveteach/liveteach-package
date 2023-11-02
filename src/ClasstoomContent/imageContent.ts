import { MediaContentType } from "./enums";
import { MediaContent } from "./mediaContent";
import { ImageContentConfig } from "./types/mediaContentConfigs";

export class ImageContent extends MediaContent {
    constructor(_screenConfig: ImageContentConfig) {
        super(_screenConfig)
    }

    play(): void {
        super.play()
    }

    stop(): void {
        super.stop()
    }

    resume(): void {
        super.resume()
    }

    pause(): void {
        super.pause()
    }

    getContentType(): MediaContentType {
        return MediaContentType.image
    }

    update(_dt: number): void {
        
    }

}