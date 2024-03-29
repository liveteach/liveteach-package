import { Entity, Material, TextureUnion, VideoPlayer, engine } from "@dcl/sdk/ecs";
import { MediaContentType } from "./enums";
import { MediaContent } from "./mediaContent";
import { VideoContentConfig } from "./types/mediaContentConfigs";
import { ClassroomManager } from "../classroom";

export class VideoContent extends MediaContent {
    videoEntity: Entity
    videoTexture: TextureUnion
    offset: number = 0

    constructor(_screenConfig: VideoContentConfig) {
        super(_screenConfig)

        this.videoEntity = engine.addEntity()

        const guid = ClassroomManager.activeClassroom?.guid ?? ""
        VideoPlayer.createOrReplace(this.videoEntity, {
            src: _screenConfig.src.startsWith("http") ? _screenConfig.src : ("content/" + guid + "/" + _screenConfig.src),
            playing: false,
            position: _screenConfig.position,
            volume: _screenConfig.volume
        })

        this.videoTexture = Material.Texture.Video({ videoPlayerEntity: this.videoEntity })
    }

    play(): void {
        super.play()
        VideoPlayer.getMutable(this.videoEntity).playing = true

        const config = this.configuration as VideoContentConfig
        config.playing = true
    }

    stop(): void {
        super.stop()
        VideoPlayer.getMutable(this.videoEntity).playing = false
        
        const config = this.configuration as VideoContentConfig
        config.playing = false
    }

    resume(): void {
        super.resume()
        VideoPlayer.getMutable(this.videoEntity).playing = true
        
        const config = this.configuration as VideoContentConfig
        config.playing = true
    }

    pause(): void {
        super.pause()
        VideoPlayer.getMutable(this.videoEntity).playing = false
        
        const config = this.configuration as VideoContentConfig
        config.playing = false
    }

    setVolume(_value: number): void {
        VideoPlayer.getMutable(this.videoEntity).volume = _value
        
        const config = this.configuration as VideoContentConfig
        config.volume = _value
    }

    getContentType(): MediaContentType {
        return MediaContentType.video
    }

    update(_dt: number): void {
        if (!this.isPaused) {
            this.offset += _dt
        
            const config = this.configuration as VideoContentConfig
            config.position = this.offset
        }
    }
}