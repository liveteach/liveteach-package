import { Animator, Entity, GltfContainer, Transform, engine } from "@dcl/ecs";
import { MediaContentType } from "./enums";
import { MediaContent } from "./mediaContent";
import { ModelContentConfig } from "./types/mediaContentConfigs";
import { Quaternion, Vector3 } from "@dcl/sdk/math";
import { ClassroomManager } from "../classroom";

export class ModelContent extends MediaContent {
    entity: Entity
    currentClip: string = ""
    spinSpeed: number = 40

    constructor(_config: ModelContentConfig) {
        super(_config)

        this.entity = engine.addEntity()
        Transform.create(this.entity, {
            parent: _config.parent,
            position: _config.position,
            rotation: _config.rotation ?? Quaternion.Identity(),
            scale: Vector3.Zero()
        })

        if(_config.src.length>0){
            const guid = ClassroomManager.activeClassroom?.guid ?? ""
            GltfContainer.create(this.entity, {
                src: "content/" + guid + "/" + _config.src
            })
        }

        const animator = Animator.create(this.entity, {
            states: []
        })

        for (let animation of _config.animations) {
            animator.states = animator.states.concat({
                clip: animation.clip,
                loop: animation.loop,
                playing: false
            })
        }

        if(_config.animations.length > 0) {
            this.setAnimation(_config.animations[0].clip, false)
        }

        this.isPaused = !_config.playing
    }

    setAnimation(_clip: string, _play: boolean = true) {
        this.currentClip = _clip
        if(_play) this.play()
    }

    play(): void {
        super.play()
        this.playAnimation()
        Transform.getMutable(this.entity).scale = (this.configuration as ModelContentConfig).scale ?? Vector3.One()
    }

    stop(): void {
        super.stop()
        this.stopAnimation(true)
        Transform.getMutable(this.entity).scale = Vector3.Zero()
    }

    resume(): void {
        this.playAnimation()
        super.resume()
    }

    pause(): void {
        super.pause()
        this.stopAnimation(false)
    }

    getContentType(): MediaContentType {
        return MediaContentType.model
    }

    update(_dt: number): void {
        const modelConfig = this.configuration as ModelContentConfig
        if (modelConfig.spin !== null && modelConfig.spin !== undefined && modelConfig.spin && !this.isPaused) {
            const rot = Transform.getMutable(this.entity).rotation
            let yRotation = Quaternion.toEulerAngles(rot).y
            let xRotation = Quaternion.toEulerAngles(rot).x
            let zRotation = Quaternion.toEulerAngles(rot).z

            yRotation += _dt * this.spinSpeed

            Transform.getMutable(this.entity).rotation = Quaternion.fromEulerDegrees(xRotation, yRotation, zRotation)
        }
    }

    private playAnimation(): void {
        Animator.playSingleAnimation(this.entity, this.currentClip, !this.isPaused)
    }

    private stopAnimation(_reset: boolean): void {
        Animator.stopAllAnimations(this.entity, _reset)
    }
}