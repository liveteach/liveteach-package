import { triggerSceneEmote } from "~system/RestrictedActions"
import { Toast, Toaster } from "../notifications"
import { UserDataHelper } from "../classroom/userDataHelper"

export class AnimationHelper {
    constructor(){

    }

    static sit(){
        triggerSceneEmote({ src: 'animations/sit_emote.glb', loop: true })
    }

    static handUp(){
        triggerSceneEmote({ src: 'animations/handup_emote.glb', loop: true })
        Toaster.popToast(UserDataHelper.GetDisplayName() + " put their hand up") 
    }

    clap(){
        // Not implemented

    }
}