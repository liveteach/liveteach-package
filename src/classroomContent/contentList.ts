import { MediaContent } from "./mediaContent"

export class ContentList {
    content: MediaContent[] = []
    index: number = 0

    constructor(_content: MediaContent[]) {
        this.content = _content
    }

    getContent() {
        return this.content[this.index]
    }

    stop(){
        this.content[this.index].stop()
    }

    next() {
        this.stop()
        this.index++
        if (this.index > this.content.length - 1) {
            this.index = 0
        }
    }

    previous() {
        this.stop()
        this.index--
        if (this.index < 0) {
            this.index = this.content.length - 1
        }
    }

    toStart() {
        this.stop()
        this.index = 0
    }

    toEnd() {
        this.stop()
        this.index = this.content.length - 1
    }
}