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

    next() {
        if (!ClassroomManager.classController.isTeacher() || !this.poweredOn) {
            return
        }
        this.currentContent.next()
        this.playContent()
    }

    previous() {
        if (!ClassroomManager.classController.isTeacher() || !this.poweredOn) {
            return
        }
        this.currentContent.previous()
        this.playContent()
    }

    toStart() {
        if (!ClassroomManager.classController.isTeacher() || !this.poweredOn) {
            return
        }
        this.currentContent.toStart()
        this.playContent()
    }

    toEnd() {
        if (!ClassroomManager.classController.isTeacher() || !this.poweredOn) {
            return
        }
        this.currentContent.toEnd()
        this.playContent()
    }

    showPresentation() {
        if (!ClassroomManager.classController.isTeacher() || !this.poweredOn) {
            return
        }

        console.log("show presentation")
        if (this.currentContent != undefined) {
            this.currentContent.stop()
        }
        this.currentContent = this.imageContent
        this.playContent()
    }

    showVideo() {
        if (!ClassroomManager.classController.isTeacher() || !this.poweredOn) {
            return
        }

        console.log("show video")
        if (this.currentContent != undefined) {
            this.currentContent.stop()
        }
        this.currentContent = this.videoContent
        this.playContent()
    }

    showModel() {
        if (!ClassroomManager.classController.isTeacher() || !this.poweredOn) {
            return
        }

        console.log("show model")
        if (this.currentContent != undefined) {
            this.currentContent.stop()
        }
        this.currentContent = this.modelContent
        this.playContent()
    }

    toggleMute() {
        if (!ClassroomManager.classController.isTeacher() || !this.poweredOn) {
            return
        }

        this.muted = !this.muted
        if (this.currentContent != undefined) {
            const content = this.currentContent.getContent()
            if (content.getContentType() == MediaContentType.video) {
                if (this.muted) {
                    (content as VideoContent).setVolume(0)
                    console.log("mute")
                }
                else {
                    (content as VideoContent).setVolume(1)
                    console.log("unmute")
                }
            }
        }
    }

    playPause() {
        if (!ClassroomManager.classController.isTeacher() || !this.poweredOn) {
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
        }
    }


    powerToggle(_allowStudentControl: boolean = false) {
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
            if (this.currentContent != undefined) {
                this.currentContent.stop()
            }
            this.hideContent()
        } else if (this.poweredOn) {
            this.unHideContent()
        }

        if (!this.poweredOn) {
            this.muted = false
        }
    }

    addScreen(_position: Vector3, _rotation: Quaternion, _scale: Vector3, _parent?: Entity) {
        this.screenDisplays.push(new ScreenDisplay(_position, _rotation, _scale, _parent))
        this.hideContent()
    }

    loadContent() {
        if (ClassroomManager.activeContent === undefined || ClassroomManager.activeContent === null
            || ClassroomManager.classController === undefined || ClassroomManager.classController === null || !ClassroomManager.classController.isTeacher()) return

        let imageContentList: ImageContent[] = []
        let videoContentList: VideoContent[] = []
        let modelContentList: ModelContent[] = []

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

        ClassroomManager.activeContent.models.forEach(model => {
            modelContentList.push(new ModelContent({
                src: model.src,
                caption: model.caption,
                position: model.position ?? Vector3.Zero(),
                scale: model.scale ?? Vector3.One(),
                parent: ClassroomManager.originEntity,
                animations: model.animations ,
                spin: model.spin,
                replace: model.replace
            }))
        });

        this.imageContent = new ContentList(imageContentList)
        this.videoContent = new ContentList(videoContentList)
        this.modelContent = new ContentList(modelContentList)
    }

    addStudentContent(_imageContent: ImageContentConfig, _videoContent: VideoContentConfig, _modelContent: ModelContentConfig) {
        if (ClassroomManager.classController === undefined || ClassroomManager.classController === null || !ClassroomManager.classController.isStudent()) return

        if (_imageContent) {
            const imageContent = new ImageContent({
                src: _imageContent.src,
                caption: _imageContent.caption,
                ratio: _imageContent.ratio
            })

            if (this.imageContent) {
                let index: number = -1
                for (let i = 0; i < this.imageContent.content.length; i++) {
                    if (this.imageContent.content[i].configuration.src == _imageContent.src) {
                        index = i
                        break
                    }
                }
                if (index < 0) {
                    this.imageContent.content.push(imageContent)
                    this.imageContent.index = this.imageContent.content.length - 1
                }
                else {
                    this.imageContent.index = index
                }
            }
            else {
                this.imageContent = new ContentList([imageContent])
            }

            if (this.currentContent) {
                this.currentContent.stop()
            }
            this.currentContent = this.imageContent
        }

        if (_videoContent) {
            const videoContent = new VideoContent({
                src: _videoContent.src,
                caption: _videoContent.caption,
                ratio: _videoContent.ratio,
                playing: _videoContent.playing,
                position: _videoContent.position,
                volume: _videoContent.volume
            })

            if (this.videoContent) {
                let index: number = -1
                for (let i = 0; i < this.videoContent.content.length; i++) {
                    if (this.videoContent.content[i].configuration.src == _videoContent.src) {
                        index = i
                        break
                    }
                }
                if (index < 0) {
                    this.videoContent.content.push(videoContent)
                    this.videoContent.index = this.videoContent.content.length - 1
                }
                else {
                    this.videoContent.index = index
                }
            }
            else {
                this.videoContent = new ContentList([videoContent])
            }

            if (this.currentContent) {
                this.currentContent.stop()
            }
            this.currentContent = this.videoContent
        }

        if (_modelContent) {
            let shouldStopPrevContent: boolean = true
            const modelContent = new ModelContent({
                src: _modelContent.src,
                caption: _modelContent.caption,
                position: _modelContent.position,
                rotation: _modelContent.rotation,
                scale: _modelContent.scale,
                parent: _modelContent.parent,
                animations: _modelContent.animations,
                spin: _modelContent.spin,
                replace: _modelContent.replace
            })

            if (this.modelContent) {
                let index: number = -1
                for (let i = 0; i < this.modelContent.content.length; i++) {
                    if (this.modelContent.content[i].configuration.src == _modelContent.src) {
                        index = i
                        break
                    }
                }
                if (index < 0) {
                    this.modelContent.content.push(modelContent)
                    this.modelContent.index = this.modelContent.content.length - 1
                }
                else {
                    this.modelContent.index = index
                }
            }
            else {
                this.modelContent = new ContentList([modelContent])
            }

            if (_modelContent.replace !== undefined && _modelContent.replace !== null && !_modelContent.replace) {
                shouldStopPrevContent = this.currentContent.getContent().getContentType() != MediaContentType.model
            }
            if (this.currentContent && shouldStopPrevContent) {
                this.currentContent.stop()
            }
            this.currentContent = this.modelContent
        }
    }

    playContent() {
        const content = this.currentContent.getContent()

        if (content.getContentType() == MediaContentType.model) {
            content.play()
        }
        else {
            this.screenDisplays.forEach(display => {
                display.startContent(content)
            });
        }

        if (content.getContentType() == MediaContentType.video) {
            (content as VideoContent).setVolume(this.muted ? 0 : 1)
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
                const modelConfig = content.configuration as ModelContentConfig
                ClassroomManager.DisplayModel({
                    src: modelConfig.src,
                    caption: modelConfig.caption,
                    animations: modelConfig.animations,
                    parent: modelConfig.parent,
                    position: modelConfig.position,
                    rotation: modelConfig.rotation,
                    scale: modelConfig.scale,
                    spin: modelConfig.spin,
                    replace: modelConfig.replace
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
        if (this.poweredOn && this.currentContent) {
            let content = this.currentContent.getContent()
            content.update(_dt)
            if (!content.isShowing) {
                this.currentContent.next()
            }
        }
    }
}