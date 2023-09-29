import { SeatingData } from "./SeatingData"
import { SeatManager } from "./seatManager"

import { UserManager } from "./user"

export class SeatingController {

    constructor(_seatingData:SeatingData){
        new UserManager()

        new SeatManager(_seatingData) 
    }
}