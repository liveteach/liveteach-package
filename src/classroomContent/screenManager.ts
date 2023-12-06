// @ts-nocheck
import { Entity, VideoPlayer, engine } from "@dcl/sdk/ecs";
import { ScreenDisplay } from "./screenDisplay";
import { Quaternion, Vector3 } from "@dcl/sdk/math";
import { ContentList } from "./contentList";
import { MediaContentType } from "./enums";
import { ClassroomManager } from "../classroom";
import { ImageContentConfig, VideoContentConfig, ModelContentConfig } from "./types/mediaContentConfigs";
import { VideoContent } from "./videoContent";
import { ImageContent } from "./imageContent";
import { ModelContent } from "./modelContent";

export class ScreenManager {

    screenDisplays: ScreenDisplay[] = []
    currentContent: ContentList

    imageContent: ContentList
    videoContent: ContentList
    modelContent: ContentList

    poweredOn: boolean = false
    muted: boolean = false

    constructor() {
        engine.addSystem(this.update.bind(this))
    }

    isPaused(): boolean {
        if (!this.poweredOn || this.currentContent === undefined) return false

        return this.currentContent.getContent().isPaused
    }

    next(): void {
        if (!ClassroomManager.classController.isTeacher() || !this.poweredOn || this.currentContent === undefined) {
            return
        }
        this.currentContent.next()
        this.playContent()
    }

    previous(): void {
        if (!ClassroomManager.classController.isTeacher() || !this.poweredOn || this.currentContent === undefined) {
            return
        }
        this.currentContent.previous()
        this.playContent()
    }

    toStart(): void {
        if (!ClassroomManager.classController.isTeacher() || !this.poweredOn || this.currentContent === undefined) {
            return
        }
        this.currentContent.toStart()
        this.playContent()
    }

    toEnd(): void {
        if (!ClassroomManager.classController.isTeacher() || !this.poweredOn || this.currentContent === undefined) {
            return
        }
        this.currentContent.toEnd()
        this.playContent()
    }

    showPresentation(): void {
        if (!ClassroomManager.classController.isTeacher() || !this.poweredOn) {
            return
        }

        console.log("show presentation")
        if (this.currentContent != undefined && this.currentContent.getContent().getContentType() == MediaContentType.image) {
            this.currentContent.stop()
            this.hideContent()
            if (this.modelContent?.getContent().isShowing) {
                this.currentContent = this.modelContent
            }
            else {
                this.currentContent = undefined
            }
            if (ClassroomManager.classController === undefined || ClassroomManager.classController === null || !ClassroomManager.classController.isTeacher()) return

            ClassroomManager.DeactivateScreens()
            return
        }
        else if (this.videoContent != undefined) {
            this.videoContent.stop()
        }
        this.unHideContent()
        this.currentContent = this.imageContent
        this.playContent()
    }

    showVideo(): void {
        if (!ClassroomManager.classController.isTeacher() || !this.poweredOn) {
            return
        }

        console.log("show video")
        if (this.currentContent != undefined && this.currentContent.getContent().getContentType() == MediaContentType.video) {
            this.currentContent.stop()
            this.hideContent()
            if (this.modelContent?.getContent().isShowing) {
                this.currentContent = this.modelContent
            }
            else {
                this.currentContent = undefined
            }
            if (ClassroomManager.classController === undefined || ClassroomManager.classController === null || !ClassroomManager.classController.isTeacher()) return

            ClassroomManager.DeactivateScreens()
            return
        }
        else if (this.currentContent != undefined && this.currentContent.getContent().getContentType() != MediaContentType.model) {
            this.currentContent.stop()
        }
        this.unHideContent()
        this.currentContent = this.videoContent
        this.playContent()
    }

    showModel(): void {
        if (!ClassroomManager.classController.isTeacher() || !this.poweredOn) {
            return
        }

        console.log("show model")
        if (this.currentContent != undefined && this.currentContent.getContent().getContentType() == MediaContentType.model) {
            this.currentContent.stop()
            if (this.videoContent?.getContent().isShowing) {
                this.currentContent = this.videoContent
            }
            else if (this.imageContent?.getContent().isShowing) {
                this.currentContent = this.imageContent
            }
            else {
                this.currentContent = undefined
            }
            if (ClassroomManager.classController === undefined || ClassroomManager.classController === null || !ClassroomManager.classController.isTeacher()) return

            ClassroomManager.DeactivateModels()
            return
        }
        else if (this.currentContent != undefined && this.currentContent.getContent().getContentType() == MediaContentType.image) {
            this.currentContent.stop()
        }
        this.currentContent = this.modelContent
        this.playContent()
    }

    setVolume(_volume: number): void {
        console.log("setVolume: " + _volume)
        if (_volume > 0) {
            this.muted = false
        }
        else {
            this.muted = true
        }
        if (this.currentContent != undefined) {
            const content = this.currentContent.getContent()
            if (content.getContentType() == MediaContentType.video) {
                (content as VideoContent).setVolume(_volume)
            }
        }
    }

    toggleMute(): void {
        if (!ClassroomManager.classController.isTeacher() || !this.poweredOn) {
            return
        }

        this.muted = !this.muted
        if (this.currentContent != undefined) {
            const content = this.currentContent.getContent()
            if (content.getContentType() == MediaContentType.video) {
                if (this.muted) {
                    (content as VideoContent).setVolume(0)
                    ClassroomManager.SetVideoVolume(0)
                    console.log("mute")
                }
                else {
                    (content as VideoContent).setVolume(1)
                    ClassroomManager.SetVideoVolume(1)
                    console.log("unmute")
                }
            }
        }
    }

    playPause(): void {
        if (!this.poweredOn) {
            return
        }
        if (this.currentContent != undefined) {
            const content = this.currentContent.getContent()
            if (content.isPaused) {
                content.resume()
                console.log("resume")
            }
            else {
                content.pause()
                console.log("pause")
            }

            if (ClassroomManager.classController === undefined || ClassroomManager.classController === null || !ClassroomManager.classController.isTeacher()) return

            switch (content.getContentType()) {
                case MediaContentType.video:
                    if (content.isPaused) {
                        ClassroomManager.PauseVideo()
                    }
                    else {
                        ClassroomManager.ResumeVideo()
                    }
                    break
                case MediaContentType.model:
                    if (content.isPaused) {
                        ClassroomManager.PauseModel()
                    }
                    else {
                        ClassroomManager.ResumeModel()
                    }
                    break
            }
        }
    }


    powerToggle(_allowStudentControl: boolean = false): void {
        if (ClassroomManager.classController === undefined || ClassroomManager.classController === null) {
            return
        }

        if ((!_allowStudentControl || !ClassroomManager.classController.isStudent())
            && (ClassroomManager.activeContent === undefined || ClassroomManager.activeContent === null || !ClassroomManager.classController.isTeacher())) return

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
            if (this.imageContent != undefined) {
                this.imageContent.stop()
            }
            if (this.videoContent != undefined) {
                this.videoContent.stop()
            }
            if (this.modelContent != undefined) {
                this.modelContent.stop()
            }
            this.hideContent()

            if (ClassroomManager.classController === undefined || ClassroomManager.classController === null || !ClassroomManager.classController.isTeacher()) return

            ClassroomManager.DeactivateScreens()
            ClassroomManager.DeactivateModels()
        } else if (this.poweredOn) {
            this.unHideContent()
            this.playContent()
        }

        if (!this.poweredOn) {
            this.muted = false
        }
    }

    addScreen(_position: Vector3, _rotation: Quaternion, _scale: Vector3, _parent?: Entity): void {
        this.screenDisplays.push(new ScreenDisplay(_position, _rotation, _scale, _parent))
        this.hideContent()
    }

    loadContent(): void {
        if (ClassroomManager.activeContent === undefined || ClassroomManager.activeContent === null
            || ClassroomManager.classController === undefined || ClassroomManager.classController === null) return

        let imageContentList: ImageContent[] = []
        let videoContentList: VideoContent[] = []
        let modelContentList: ModelContent[] = []

        if (ClassroomManager.activeContent.images) {
            ClassroomManager.activeContent.images.forEach(image => {
                imageContentList.push(new ImageContent({
                    src: image.src,
                    caption: image.caption,
                    showing: image.showing ?? false,
                    ratio: image.ratio
                }))
            });
        }

        if (ClassroomManager.activeContent.videos) {
            ClassroomManager.activeContent.videos.forEach(video => {
                videoContentList.push(new VideoContent({
                    src: video.src,
                    caption: video.caption,
                    showing: video.showing ?? false,
                    ratio: video.ratio,
                    playing: false,
                    position: video.position ?? 0,
                    volume: video.volume ?? 1
                }))
            });
        }

        if (ClassroomManager.activeContent.models) {
            ClassroomManager.activeContent.models.forEach(model => {
                modelContentList.push(new ModelContent({
                    src: model.src,
                    caption: model.caption,
                    showing: model.showing ?? false,
                    position: model.position ?? Vector3.Zero(),
                    scale: model.scale ?? Vector3.One(),
                    parent: ClassroomManager.originEntity,
                    animations: model.animations,
                    spin: model.spin,
                    replace: model.replace,
                    playing: model.playing ?? true
                }))
            });
        }

        this.imageContent = new ContentList(imageContentList)
        this.videoContent = new ContentList(videoContentList)
        this.modelContent = new ContentList(modelContentList)
    }

    playContent(): void {
        const content = this.currentContent.getContent()

        if (content.getContentType() == MediaContentType.model) {
            content.play()
            this.currentContent.overlapStack.forEach(stackedContent => {
                stackedContent.play()
            });
        }
        else {
            this.screenDisplays.forEach(display => {
                display.startContent(content)
            });
        }

        if (content.getContentType() == MediaContentType.video) {
            (content as VideoContent).setVolume((content.configuration as VideoContentConfig).volume)
        }

        if (content.getContentType() == MediaContentType.image && this.videoContent && this.videoContent.getContent().isShowing) {
            this.videoContent.stop()
        }

        if (ClassroomManager.classController === undefined || ClassroomManager.classController === null || !ClassroomManager.classController.isTeacher()) return

        switch (content.getContentType()) {
            case MediaContentType.image:
                const imageConfig = content.configuration as ImageContentConfig
                ClassroomManager.DisplayImage({
                    src: imageConfig.src,
                    caption: imageConfig.caption,
                    ratio: imageConfig.ratio
                })
                break
            case MediaContentType.video:
                const videoConfig = content.configuration as VideoContentConfig
                ClassroomManager.PlayVideo({
                    src: videoConfig.src,
                    caption: videoConfig.caption,
                    ratio: videoConfig.ratio,
                    position: VideoPlayer.getMutable((content as VideoContent).videoEntity).position
                })
                break
            case MediaContentType.model:
                this.currentContent.overlapStack.forEach(stackedContent => {
                    const stackedModelConfig = stackedContent.configuration as ModelContentConfig
                    ClassroomManager.PlayModel({
                        src: stackedModelConfig.src,
                        caption: stackedModelConfig.caption,
                        animations: stackedModelConfig.animations,
                        parent: stackedModelConfig.parent,
                        position: stackedModelConfig.position,
                        rotation: stackedModelConfig.rotation,
                        scale: stackedModelConfig.scale,
                        spin: stackedModelConfig.spin,
                        replace: stackedModelConfig.replace,
                        playing: stackedModelConfig.playing
                    })
                });

                const modelConfig = content.configuration as ModelContentConfig
                ClassroomManager.PlayModel({
                    src: modelConfig.src,
                    caption: modelConfig.caption,
                    animations: modelConfig.animations,
                    parent: modelConfig.parent,
                    position: modelConfig.position,
                    rotation: modelConfig.rotation,
                    scale: modelConfig.scale,
                    spin: modelConfig.spin,
                    replace: modelConfig.replace,
                    playing: modelConfig.playing
                })
                break
        }
    }

    hideContent(): void {
        this.screenDisplays.forEach(display => {
            display.hideContent()
        });
    }

    unHideContent(): void {
        this.screenDisplays.forEach(display => {
            display.unHideContent()
        });
    }

    private update(_dt: number): void {
        if (!this.poweredOn) return

        if (this.imageContent) {
            const content = this.imageContent.getContent()
            content.update(_dt)
        }

        if (this.videoContent) {
            const content = this.videoContent.getContent()
            content.update(_dt)
        }

        if (this.modelContent) {
            const content = this.modelContent.getContent()
            content.update(_dt)
        }

        if (this.currentContent && !this.currentContent.getContent().isShowing && ClassroomManager.classController?.isTeacher()) {
            this.currentContent.next()
        }
    }
}