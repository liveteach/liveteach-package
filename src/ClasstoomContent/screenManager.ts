import { Entity, VideoPlayer, engine } from "@dcl/sdk/ecs";
import { ScreenDisplay } from "./screenDisplay";
import { Quaternion, Vector3 } from "@dcl/sdk/math";
import { ContentList } from "./contentList";
import { MediaContentType } from "./enums";
import { ClassroomManager } from "../classroom";
import { ScreenContentConfig } from "./types/mediaContentConfigs";
import { VideoContent } from "./videoContent";
import { ImageContent } from "./imageContent";

export class ScreenManager {

    screenDisplays: ScreenDisplay[] = []
    currentContent: ContentList

    imageContent: ContentList
    videoContent: ContentList
    modelContent: ContentList

    poweredOn: boolean = true

    constructor() {
        engine.addSystem(this.update.bind(this))
    }

    next() {
        if (!this.poweredOn) {
            return
        }
        this.currentContent.next()
        this.playContent()
    }

    previous() {
        if (!this.poweredOn) {
            return
        }
        this.currentContent.previous()
        this.playContent()
    }

    toStart() {
        if (!this.poweredOn) {
            return
        }
        this.currentContent.toStart()
        this.playContent()
    }

    toEnd() {
        if (!this.poweredOn) {
            return
        }
        this.currentContent.toEnd()
        this.playContent()
    }

    showPresentation() {
        console.log("show presentation")
        if (!this.poweredOn) {
            return
        }
        if (this.currentContent != undefined) {
            this.currentContent.stop()
        }
        this.currentContent = this.imageContent
        this.playContent()
    }

    showVideo() {
        console.log("show video")
        if (!this.poweredOn) {
            return
        }
        if (this.currentContent != undefined) {
            this.currentContent.stop()
        }
        this.currentContent = this.videoContent
        this.playContent()
    }

    showModel() {
        console.log("show model")
        if (!this.poweredOn) {
            return
        }
        if (this.currentContent != undefined) {
            this.currentContent.stop()
        }
        this.currentContent = this.modelContent
        this.playContent()
    }

    powerToggle() {
        this.poweredOn = !this.poweredOn

        // When turning on try and find content to auto set to
        if (this.poweredOn && this.currentContent == undefined) {
            if (this.imageContent != undefined) {
                this.showPresentation()
            } else if (this.videoContent != undefined) {
                this.showVideo()
            } else if (this.modelContent != undefined) {
                this.showModel()
            }
            this.unHideContent()
        } else if (!this.poweredOn) {
            if (this.currentContent != undefined) {
                this.currentContent.stop()
            }
            this.hideContent()
        } else if (this.poweredOn) {
            this.unHideContent()
        }
    }

    addScreen(_position: Vector3, _rotation: Quaternion, _scale: Vector3, _parent?: Entity) {
        this.screenDisplays.push(new ScreenDisplay(_position, _rotation, _scale, _parent))
    }

    loadContent() {
        if (ClassroomManager.activeContent === undefined || ClassroomManager.activeContent === null) return

        let imageContentList: ImageContent[] = []
        let videoContentList: ImageContent[] = []
        let modelContentList: ImageContent[] = []

        ClassroomManager.activeContent.images.forEach(image => {
            imageContentList.push(new ImageContent({
                src: image.src,
                caption: image.caption,
                ratio: image.ratio
            }))
        });

        ClassroomManager.activeContent.videos.forEach(video => {
            videoContentList.push(new VideoContent({
                src: video.src,
                caption: video.caption,
                ratio: video.ratio,
                playing: false,
                position: 0,
                volume: 1
            }))
        });

        this.imageContent = new ContentList(imageContentList)
        this.videoContent = new ContentList(videoContentList)
    }

    private playContent() {
        const content = this.currentContent.getContent()
        const screenConfig = content.configuration as ScreenContentConfig

        this.screenDisplays.forEach(display => {
            display.startContent(content)
        });

        switch (content.getContentType()) {
            case MediaContentType.image:
                ClassroomManager.DisplayImage({
                    src: content.configuration.src,
                    "caption": "caption",
                    ratio: screenConfig.ratio
                })
                break
            case MediaContentType.video:
                ClassroomManager.PlayVideo({
                    src: content.configuration.src,
                    "caption": "caption",
                    ratio: screenConfig.ratio,
                    position: VideoPlayer.getMutable((content as VideoContent).videoEntity).position
                })
                break
        }
    }

    private hideContent() {
        this.screenDisplays.forEach(display => {
            display.hideContent()
        });
    }

    private unHideContent() {
        this.screenDisplays.forEach(display => {
            display.unHideContent()
        });
    }

    private update(_dt: number) {
        if (this.poweredOn) {
            let content = this.currentContent.getContent()
            content.update(_dt)
            if (!content.isShowing) {
                this.currentContent.next()
            }
        }
    }
}