import * as utils from '@dcl-sdk/utils'

export class Toast {
    message: string = ""

    growingToast: boolean = false
    toastWidth: number = 400
    toastGrowSpeed:number = 500
    toastShrinkSpeed:number = 200
    maxToastHeight: number = 50
    minToastHeight: number = -200
    currentToastHeight: number = this.minToastHeight
    reduceWidth:boolean = false

    toastHasToasted: boolean = false

    timerRunning:boolean = false
    timeActive:number = 0

    constructor(_message:string)
    {
        this.message = _message
        this.growingToast = true
    }

    runTimer(){
        this.timerRunning = true
        utils.timers.setTimeout(() => {
            this.growingToast = false
        },2000-this.timeActive) 

        utils.timers.setTimeout(() => {
           this.reduceWidth = true 
        },4000-this.timeActive)

        utils.timers.setTimeout(() => {
            this.toastHasToasted = true
         },5000-this.timeActive) 
    }


}