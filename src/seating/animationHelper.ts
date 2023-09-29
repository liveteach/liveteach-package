import { triggerSceneEmote } from "~system/RestrictedActions"

export class AnimationHelper {
    constructor(){

    }

    static sit(){
        triggerSceneEmote({ src: 'animations/sit_emote.glb', loop: true })
    }

    static handUp(){
        triggerSceneEmote({ src: 'animations/handup_emote.glb', loop: true })
    }

    clap(){
        // Not implemented

    }
}