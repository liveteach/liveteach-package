import { Entity, InputAction} from "@dcl/sdk/ecs";
import { Quaternion, Vector3 } from "@dcl/sdk/math";
import { movePlayerTo, triggerSceneEmote } from "~system/RestrictedActions";
import * as utils from '@dcl-sdk/utils'

import * as ui from 'dcl-ui-toolkit'
import { SeatManager } from "./seatManager";
import { AnimationHelper } from "./animationHelper";
import { UserType } from "../enums";
import { User, UserManager } from "./user";
import { DclUtils } from "../dclutils";
import { GlobalData } from "../setup/setup";

export class Seat {
    id: number
    entity: Entity
    claimed: boolean = false
    lookAtTarget:Vector3 = Vector3.Zero()

    constructor(_id: number, _position: Vector3, _lookAtTarget:Vector3= Vector3.Zero()) {
        this.id = _id
        this.entity = GlobalData.engine.addEntity()

        GlobalData.Transform.create(this.entity, {
            position: _position,
            scale: Vector3.create(0.5, 1, 0.5)
        })

        //MeshRenderer.setBox(entity)
        this.createCollider()

        let self = this

        GlobalData.PointerEventsSystem.onPointerDown(
            {
                entity: this.entity,
                opts: { button: InputAction.IA_POINTER, hoverText: 'Sit', maxDistance: 25 },
            },
            function () {
                // Only try to sit in a seat if I havent got one already
                console.log(SeatManager.mySeatID)

                if (SeatManager.mySeatID == -1) {
                    // Is this seat free?
                    SeatManager.checkIfSeatIsFree(self.id)
                }
            }
        )

    }

    sitDown() {
        this.removeCollider()
        ui.createComponent(ui.Announcement, { value: 'Seat already taken', duration: 50 })

        if(this.lookAtTarget!=Vector3.Zero()){
            movePlayerTo({ newRelativePosition: GlobalData.Transform.get(this.entity).position, cameraTarget: this.lookAtTarget})
        } else {
            movePlayerTo({ newRelativePosition: GlobalData.Transform.get(this.entity).position})
        }

        utils.timers.setTimeout(() => {
            let forwardVector: Vector3 = DclUtils.getForwardVector(GlobalData.Transform.get(GlobalData.engine.CameraEntity).rotation)
            let multiplyAmount: number = 0.3
            let multipliedVector: Vector3 = Vector3.create(forwardVector.x * multiplyAmount, forwardVector.y * multiplyAmount, forwardVector.z * multiplyAmount)
            let teleportPosition: Vector3 = Vector3.add(GlobalData.Transform.get(this.entity).position, multipliedVector)
            if(this.lookAtTarget!=Vector3.Zero()){
                movePlayerTo({ newRelativePosition: teleportPosition, cameraTarget: this.lookAtTarget})
            } else {
                movePlayerTo({ newRelativePosition: teleportPosition})
            }

            AnimationHelper.sit()

            UserManager.myself.userType = UserType.student

            utils.timers.setTimeout(() => {
                AnimationHelper.sit()
                utils.timers.setTimeout(() => {
                    SeatManager.seatedPosition = GlobalData.Transform.get(GlobalData.engine.PlayerEntity).position
                    SeatManager.seated = true
                },100)
            }, 200)
        }, 200)
    }

    createCollider() { 
        GlobalData.MeshCollider.setBox(this.entity)
    }

    removeCollider() {
        GlobalData.MeshCollider.deleteFrom(this.entity)
    }
}