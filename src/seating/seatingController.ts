import { Vector3 } from "@dcl/sdk/math"
import { SeatingData } from "./SeatingData"
import { SeatManager } from "./seatManager"

import { UserManager } from "./user"

export class SeatingController {

    constructor(_seatingData:SeatingData, _hideAreaPosition: Vector3, _hideAreaVolume: Vector3, _debugArea: boolean = false){
        new UserManager()

        new SeatManager(_seatingData, _hideAreaPosition, _hideAreaVolume, _debugArea) 
    }
}