import { MediaContentType } from "./enums";
import { MediaContent } from "./mediaContent";
import { ImageContentConfig } from "./types/mediaContentConfigs";

export class ImageContent extends MediaContent {
    constructor(_screenConfig: ImageContentConfig) {
        super(_screenConfig)
    }

    getContentType(): MediaContentType {
        return MediaContentType.image
    }

    update(_dt: number): void {

    }

}