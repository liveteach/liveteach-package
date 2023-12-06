import { MediaContentType } from "./enums"
import { MediaContent } from "./mediaContent"
import { ModelContentConfig } from "./types/mediaContentConfigs"

export class ContentList {
    content: MediaContent[] = []
    overlapStack: MediaContent[] = []
    index: number = 0

    constructor(_content: MediaContent[]) {
        this.content = _content
    }

    getContent() {
        return this.content[this.index]
    }

    stop() {
        this.content.forEach(c => {
            c.stop()
        })
    }

    gatedStop(_nextIndex: number) {
        if (this.content[_nextIndex].getContentType() == MediaContentType.model) {
            const modelConfig = this.content[_nextIndex].configuration as ModelContentConfig
            if (modelConfig.replace === undefined || modelConfig.replace === null || modelConfig.replace) {
                this.overlapStack.splice(0)
                this.stop()
            }
            else {
                this.overlapStack.push(this.getContent())
            }
        }
        else {
            this.stop()
        }
    }

    next() {
        let nextIndex = this.index + 1
        if (nextIndex > this.content.length - 1) {
            nextIndex = 0
        }

        this.gatedStop(nextIndex)
        this.index = nextIndex
    }

    previous() {
        let prevIndex = this.index - 1
        if (prevIndex < 0) {
            prevIndex = this.content.length - 1
        }

        
        this.gatedStop(prevIndex)
        this.index = prevIndex
    }

    toStart() {
        this.gatedStop(0)
        this.index = 0
    }

    toEnd() {
        this.gatedStop(this.content.length - 1)
        this.index = this.content.length - 1
    }
}