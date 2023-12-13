import { ClassroomManager } from "../classroom";
import { IContentUnit } from "./IContentUnit";
import { openExternalUrl } from "~system/RestrictedActions"
import { Color4 } from "@dcl/sdk/math";
import *  as  ui from 'dcl-ui-toolkit'

export class LinkUnit implements IContentUnit {

    src: string = ""
    caption: string = ""
    linkPrompt?: ui.CustomPrompt

    constructor() { }

    start(_data: any): void {
        this.src = _data.src
        this.caption = _data.caption
        this.setupUI()
    }

    end(): void {
        this.linkPrompt?.hide()
    }

    update(_data: any): void {

    }

    private setupUI(): void {
        const self = this

        this.linkPrompt = ui.createComponent(ui.CustomPrompt, {
            style: ui.PromptStyles.DARK,
            height: 200,
            onClose: () => {
                ClassroomManager.EndContentUnit()
            }
        })

        this.linkPrompt.addText({
            value: this.caption,
            xPosition: 0,
            yPosition: 50,
            color: Color4.White(),
            size: 20,
        })

        this.linkPrompt.addButton({
            style: ui.ButtonStyles.RED,
            text: 'Visit',
            xPosition: 0,
            yPosition: -50,
            onMouseDown: () => {
                openExternalUrl({ url: self.src })
            },
        })

        this.linkPrompt.show()
    }
}