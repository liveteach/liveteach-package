// @ts-nocheck
import { Entity, EntityState } from "@dcl/sdk/ecs"
import { GlobalData } from "../setup/setup"
import { Quaternion, Vector3 } from "@dcl/sdk/math"

export class DclUtils {

  static isAddedToEngine(_entity: Entity): boolean {
    let state = GlobalData.engine.getEntityState(_entity)
    return state == EntityState.UsedEntity
  }

  static setParent(_entity: Entity, _parent: Entity): void {
    let oldTransform = GlobalData.Transform.getOrCreateMutable(_entity)

    GlobalData.Transform.createOrReplace(_entity, {
      parent: _parent,
      position: oldTransform.position ? oldTransform.position : Vector3.Zero(),
      rotation: oldTransform.rotation ? oldTransform.rotation : Quaternion.Identity(),
      scale: oldTransform.scale ? oldTransform.scale : Vector3.Zero(),
    })
  }

  static removeParent(_entity: Entity): void {
    DclUtils.setParent(_entity, null)
  }

  static hideEntity(_entity: Entity): void {
    let transform = GlobalData.Transform.getMutableOrNull(_entity)
    if (transform === null || transform === undefined) return

    transform.scale = Vector3.Zero()
  }

  static showEntity(_entity: Entity, _scale: Vector3 = Vector3.One()): void {
    let transform = GlobalData.Transform.getMutableOrNull(_entity)
    if (transform === null || transform === undefined) return

    transform.scale = Vector3.clone(_scale)
  }

  static getForwardVector(_rotation: Quaternion): Vector3 {

    let x = 2 * (_rotation.x * _rotation.z + _rotation.w * _rotation.y)
    let y = 2 * (_rotation.y * _rotation.z - _rotation.w * _rotation.x)
    let z = 1 - 2 * (_rotation.x * _rotation.x + _rotation.y * _rotation.y)

    return Vector3.create(x, y, z)

  }

  static randomNumberBetween(_min: number, _max: number): number {
    return _min + Math.random() * (_max - _min)
  }
}