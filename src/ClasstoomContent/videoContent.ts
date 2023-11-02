import { Entity, Material, TextureUnion, VideoPlayer, engine } from "@dcl/sdk/ecs";
import { MediaContentType } from "./enums";
import { MediaContent } from "./mediaContent";
import { VideoContentConfig } from "./types/mediaContentConfigs";

export class VideoContent extends MediaContent {
    videoEntity: Entity
    videoTexture: TextureUnion

    constructor(_screenConfig: VideoContentConfig) {
        super(_screenConfig)

        this.videoEntity = engine.addEntity()

        VideoPlayer.createOrReplace(this.videoEntity, {
            src: _screenConfig.src,
            playing: false
        })

        this.videoTexture = Material.Texture.Video({ videoPlayerEntity: this.videoEntity })
    }

    play(): void {
        super.play()
        VideoPlayer.getMutable(this.videoEntity).playing = true
    }

    stop(): void {
        super.stop()
        VideoPlayer.getMutable(this.videoEntity).playing = false
    }

    resume(): void {
        super.resume()
        VideoPlayer.getMutable(this.videoEntity).playing = true
    }

    pause(): void {
        super.pause()
        VideoPlayer.getMutable(this.videoEntity).playing = false
    }

    getContentType(): MediaContentType {
        return MediaContentType.video
    }

    update(_dt: number): void {

    }
}