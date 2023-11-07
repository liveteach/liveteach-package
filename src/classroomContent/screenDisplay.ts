// @ts-nocheck
import { Color3, Quaternion, Vector3 } from "@dcl/sdk/math";
import { Entity, Material, MeshRenderer, TextureUnion, Transform, engine } from "@dcl/sdk/ecs"
import { MediaContent } from "./mediaContent";
import { MediaContentType } from "./enums";
import { ScreenContentConfig } from "./types/mediaContentConfigs";
import { VideoContent } from "./videoContent";

export class ScreenDisplay {

    baseEntity: Entity
    baseScreenEntity: Entity
    entity: Entity
    static videoTexture: TextureUnion
    static currentContent: MediaContent

    parent: Entity

    constructor(_position: Vector3, _rotation: Quaternion, _scale: Vector3, _parent?: Entity) {
        this.baseEntity = engine.addEntity()
        this.baseScreenEntity = engine.addEntity()
        this.entity = engine.addEntity()

        if (_parent != undefined) {
            Transform.create(this.baseEntity, {
                parent: _parent,
                position: _position,
                rotation: _rotation,
            })
        } else {
            Transform.create(this.baseEntity, {
                position: _position,
                rotation: _rotation,
            })
        }

        Transform.create(this.baseScreenEntity, { parent: this.baseEntity, scale: Vector3.One() })
        Transform.create(this.entity, { parent: this.baseScreenEntity, scale: _scale })

        MeshRenderer.setPlane(this.entity)
    }

    hideContent() {
        console.log("hide content")
        Transform.getMutable(this.baseEntity).scale = Vector3.Zero()
    }

    unHideContent() {
        console.log("unhide content")
        Transform.getMutable(this.baseEntity).scale = Vector3.One()
    }

    startContent(_content: MediaContent) {
        if(!_content) return
        
        console.log("start content")
        _content.isShowing = true
        ScreenDisplay.currentContent = _content

        Transform.getMutable(this.baseScreenEntity).scale = Vector3.One()

        const screenContentConfig = ScreenDisplay.currentContent.configuration as ScreenContentConfig
        this.setMaterial()
        
        ScreenDisplay.currentContent.play()

        if (screenContentConfig.ratio != undefined) {
            Transform.getMutable(this.entity).scale.x = Transform.getMutable(this.entity).scale.y * screenContentConfig.ratio
        } else {
            Transform.getMutable(this.entity).scale.x = Transform.getMutable(this.entity).scale.y
        }
    }

    private setMaterial(): void {
        switch (ScreenDisplay.currentContent.getContentType()) {
            case MediaContentType.image: this.setImageMaterial()
                break
            case MediaContentType.video: this.setVideoMaterial()
                break
        }
    }

    private setImageMaterial(): void {
        Material.setPbrMaterial(this.entity, {
            texture: Material.Texture.Common({
                src: ScreenDisplay.currentContent.configuration.src
            }),
            emissiveTexture: Material.Texture.Common({
                src: ScreenDisplay.currentContent.configuration.src
            }),
            emissiveColor: Color3.White(),
            emissiveIntensity: 1,
            metallic: 0,
            roughness: 1
        })
    }

    private setVideoMaterial(): void {
        const videoContent = ScreenDisplay.currentContent as VideoContent

        Material.setPbrMaterial(this.entity, {
            texture: videoContent.videoTexture,
            roughness: 1.0,
            specularIntensity: 0,
            metallic: 0,
            emissiveTexture: videoContent.videoTexture,
            emissiveColor: Color3.White(),
            emissiveIntensity: 1
        });
    }
} 