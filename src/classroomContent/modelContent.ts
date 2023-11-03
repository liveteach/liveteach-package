import { Animator, Entity, GltfContainer, Transform, engine } from "@dcl/ecs";
import { MediaContentType } from "./enums";
import { MediaContent } from "./mediaContent";
import { ModelContentConfig } from "./types/mediaContentConfigs";
import { Quaternion, Vector3 } from "@dcl/sdk/math";

export class ModelContent extends MediaContent {
    entity: Entity
    currentClip: string = ""
    spin: boolean = true
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

        GltfContainer.create(this.entity, {
            src: _config.src
        })

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

        this.spin = _config.animations.length <= 0
    }

    setAnimation(_clip: string) {
        this.currentClip = _clip
        this.play()
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
        if (this.spin !== null && this.spin !== undefined && this.spin && !this.isPaused) {
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