// @ts-nocheck
import { Entity } from "@dcl/sdk/ecs";
import { SeatingData } from "./SeatingData";
import { Seat } from "./seat";
import { MessageBus } from '@dcl/sdk/message-bus'
import { announcement } from "./ui";
import * as utils from '@dcl-sdk/utils'
import { Vector3 } from "@dcl/sdk/math";
import { getUserData } from "~system/UserIdentity";
import { GlobalData } from "../setup/setup";

export class SeatManager {

    static mySeatID: number = -1 // No seat by default
    static tryingToSit: boolean = false
    static sceneMessageBus = new MessageBus()
    static seats: Seat[] = []

    static updateTime: number = 1
    static currentUpdateInterval: number = 0

    static seatedPosition: Vector3 = Vector3.Zero()
    static seated: boolean = false

    static seatedAvatarList: string[] = []
    static myAddress: string = ""

    static hideAvatarEntity: Entity

    static connectedToWeb3: boolean = false

    seatingData: SeatingData
    hideAreaPosition: Vector3
    hideAreaVolume: Vector3
    debugArea: boolean

    constructor(_seatingData: SeatingData, _hideAreaPosition: Vector3, _hideAreaVolume: Vector3, _debugArea: boolean = false) {
        SeatManager.hideAvatarEntity = GlobalData.engine.addEntity()
        this.seatingData = _seatingData
        this.hideAreaPosition = _hideAreaPosition
        this.hideAreaVolume = _hideAreaVolume
        this.debugArea = _debugArea

        GlobalData.executeTask(async () => {
            let userData = await getUserData({})
            if (userData.data.hasConnectedWeb3) {
                SeatManager.myAddress = userData.data?.publicKey
                SeatManager.connectedToWeb3 = true
            } else {
                SeatManager.myAddress = userData.data.userId
            }
            this.load()
        })
    }

    load() {
        this.seatingData.seats.forEach(chair => {
            SeatManager.seats.push(new Seat(chair.id, chair.position, chair.lookAtTarget))
        });

        SeatManager.sceneMessageBus.on('ClaimedSeat', (data: any) => {
            console.log("Seat claimed recieved")
            SeatManager.seats.forEach(seat => {
                if (seat.id == data.id) {
                    seat.claimed = true
                }
            })
            SeatManager.addAddress(data.address)
            console.log("Seat " + data.id + " is claimed")
            console.log("addresses excluded: " + SeatManager.seatedAvatarList.length)
        })

        SeatManager.sceneMessageBus.on('UnClaimedSeat', (data: any) => {
            console.log("Seat unclaimed recieved")
            SeatManager.seats.forEach(seat => {
                if (seat.id == data.id) {
                    seat.claimed = false
                }
            })
            SeatManager.removeAddress(data.address)
            console.log("Seat " + data.id + " is released")
        })

        // Hide not seated avatars - don't do this with out web3
        if (SeatManager.connectedToWeb3) {
            GlobalData.AvatarModifierArea.create(SeatManager.hideAvatarEntity, {
                area: this.hideAreaVolume,
                modifiers: [GlobalData.AvatarModifierType.AMT_HIDE_AVATARS],
                excludeIds: SeatManager.seatedAvatarList.sort(),
            })

            if (this.debugArea) {
                MeshRenderer.setBox(hideAvatarEntity)
                GlobalData.Transform.create(SeatManager.hideAvatarEntity, {
                    position: this.hideAreaPosition,
                    scale: this.hideAreaVolume,
                })
            }
            else {

                GlobalData.Transform.create(SeatManager.hideAvatarEntity, {
                    position: this.hideAreaPosition,
                })
            }

            SeatManager.addAddress(SeatManager.myAddress)
        }

        GlobalData.engine.addSystem(this.update)
    }

    update(_dt: number) {
        SeatManager.currentUpdateInterval += _dt

        if (SeatManager.currentUpdateInterval >= SeatManager.updateTime) {
            SeatManager.currentUpdateInterval = 0

            // Brodcast my seat to everyone
            if (SeatManager.mySeatID != -1) {
                console.log("Seat claimed sent")
                SeatManager.sceneMessageBus.emit("ClaimedSeat", { id: SeatManager.mySeatID, address: SeatManager.myAddress })
            }
        }

        // Check I am still in a seated position
        if (GlobalData.Transform.get(GlobalData.engine.CameraEntity) != undefined) {
            let match = SeatManager.compareVectors(SeatManager.seatedPosition, GlobalData.Transform.get(GlobalData.engine.PlayerEntity).position)


            if (SeatManager.seated && !match) {

                // Give up my seat as I have moved from it
                console.log("Seat unclaimed sent")
                SeatManager.sceneMessageBus.emit("UnClaimedSeat", { id: SeatManager.mySeatID, address: SeatManager.myAddress })

                // Put the collider back on the seat so it can be selected again in the future
                SeatManager.seats.forEach(seat => {
                    if (seat.id == SeatManager.mySeatID) {
                        seat.createCollider()
                    }
                });

                SeatManager.mySeatID = -1
                SeatManager.seated = false
            }
        }
    }

    static addAddress(_address: string) {
        if (!SeatManager.seatedAvatarList.includes(_address)) {
            SeatManager.seatedAvatarList.push(_address)
            if (GlobalData.AvatarModifierArea.getMutableOrNull(SeatManager.hideAvatarEntity) != null) {
                GlobalData.AvatarModifierArea.getMutable(SeatManager.hideAvatarEntity).excludeIds = SeatManager.seatedAvatarList.sort()
            }
        }
    }

    static removeAddress(_address: string) {

        if (_address == SeatManager.myAddress) {
            return // Never remove your own address so you will always be visible for yourself
        }


        let seatIndex = SeatManager.seatedAvatarList.indexOf(_address)

        if (seatIndex > -1) {
            SeatManager.seatedAvatarList.splice(seatIndex, 1)
            if (GlobalData.AvatarModifierArea.getMutableOrNull(SeatManager.hideAvatarEntity) != null) {
                GlobalData.AvatarModifierArea.getMutable(SeatManager.hideAvatarEntity).excludeIds = SeatManager.seatedAvatarList.sort()
            }
        }
    }

    static compareVectors(_vector1: Vector3, _vector2: Vector3): boolean {
        let match: boolean = true

        if (_vector1.x != _vector2.x) {
            match = false
        }

        if (_vector1.y != _vector2.y) {
            match = false
        }

        if (_vector1.z != _vector2.z) {
            match = false
        }

        return match
    }

    static checkIfSeatIsFree(_seatID: number) {

        SeatManager.seats.forEach(seat => {
            if (seat.id == _seatID) {
                if (!seat.claimed) {
                    seat.claimed = true
                    SeatManager.mySeatID = _seatID
                    seat.sitDown()
                    SeatManager.sceneMessageBus.emit("ClaimedSeat", { id: SeatManager.mySeatID, address: SeatManager.myAddress })
                } else {
                    announcement.value = "Seat already taken"
                    // announcement.show()
                    // utils.timers.setTimeout(() => {
                    //     announcement.hide()
                    // }, 1000)
                }
            }
        })

    }

}
