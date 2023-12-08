import { triggerSceneEmote } from "~system/RestrictedActions"
import { Toast, Toaster } from "../notifications"
import { UserDataHelper } from "../classroom/userDataHelper"

export class AnimationHelper {
    constructor(){

    }

    static sit(_animationFilePath = 'animations/sit_emote.glb'){
        triggerSceneEmote({ src: _animationFilePath, loop: true })
    }

    static handUp(_animationFilePath = 'animations/handup_emote.glb'){
        triggerSceneEmote({ src: _animationFilePath, loop: true })
        Toaster.popToast(UserDataHelper.GetDisplayName() + " put their hand up") 
    }

    static clap(_animationFilePath = 'animations/clap_emote.glb'){
        triggerSceneEmote({ src: _animationFilePath, loop: true })
    }
}