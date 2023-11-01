import { Color4 } from "@dcl/sdk/math"
import ReactEcs, { Label, PositionUnit, UiEntity } from "@dcl/sdk/react-ecs"
import { Toast } from "./Toast"
import { GlobalData } from "../setup/setup"

export class Toaster {

    static toasts: Toast[] = []

    constructor() {
        GlobalData.engine.addSystem(this.update)
    }

    update(dt: number) {
        Toaster.toasts.forEach((toast, index) => {

            if (index == 0) {
                if (!toast.timerRunning) {
                    toast.runTimer()
                }
            }

            toast.timeActive += dt * 1000
            if (toast.timeActive > 2000) {
                toast.timeActive = 2000 // Cap at 2000
            }

            if (toast.growingToast) {
                toast.currentToastHeight += dt * toast.toastGrowSpeed
                if (toast.currentToastHeight > toast.maxToastHeight) {
                    toast.currentToastHeight = toast.maxToastHeight
                }
            } else {
                toast.currentToastHeight -= dt * toast.toastShrinkSpeed
                if (toast.currentToastHeight <= toast.minToastHeight) {
                    toast.currentToastHeight = toast.minToastHeight
                }
            }

            if (toast.reduceWidth) {
                toast.toastWidth -= dt * 400
            }

            // If toast has toasted get rid of it
            if (toast.toastHasToasted) {
                Toaster.toasts.splice(index, 1)
            }
        });
        Toaster.toasts.forEach((toast, index) => {
            // If toast has toasted get rid of it
            if (toast.toastHasToasted) {
                Toaster.toasts.splice(index, 1)
            }
        })

    }

    static popToast(_text: string) {
        this.toasts.push(new Toast(_text))
    }

    static createToasts() {
        return Array.from(Toaster.toasts, (toast, index) =>
            <UiEntity
                key={"toastSubContainer"}
                uiTransform={{
                    position: { bottom: toast.currentToastHeight },
                    width: toast.toastWidth,
                    height: 150,
                    justifyContent: 'center',
                }}
                uiBackground={{
                    textureMode: 'nine-slices',
                    texture: { src: "images/ui/toastBackground.png" },
                    textureSlices: {
                        top: 0.5,
                        bottom: 0.5,
                        left: 0.5,
                        right: 0.5
                    }
                }}
            >
                <Label
                    key={"toastMessage"}
                    value={toast.message}
                    color={Color4.fromInts(255, 255, 255, 255)}
                    fontSize={24}
                    font="serif"
                //textAlign="middle-center"
                >
                </Label>

            </UiEntity>
        )
    }

}

export const ToastUI = () => (
    <UiEntity
        key={"toastContainer"}
        uiTransform={{
            positionType: "absolute",
            width: "100%",
            justifyContent: 'flex-start',
            position: { bottom: 50 }
        }}
    >
        {Toaster.createToasts()}
    </UiEntity>
)