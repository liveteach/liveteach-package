import { Color4 } from "@dcl/sdk/math"
import ReactEcs, { Label, UiEntity } from "@dcl/sdk/react-ecs"
import { UserData } from "~system/UserIdentity"

export class InfoUI {
    private static visibility: boolean = false
    private static displayName: string = ""
    private static publicKey: string = ""
    private static hasConnectedWeb3: string = ""
    private static userId: string = ""
    private static ethGasPrice: string = ""
    private static ethBalance: string = ""

    private static component = () => (
        <UiEntity uiTransform={{
            position: { right: '10px', top: '120px' },
            positionType: 'absolute',
            width: 500,
            height: 500,
            display: InfoUI.visibility ? 'flex' : 'none'
        }}
            uiBackground={{
                color: Color4.create(0, 0, 0, 0.9)
            }}>
            <Label
                value={InfoUI.displayName}
                color={Color4.White()}
                fontSize={16}
                font="serif"
                textAlign="top-left"
                uiTransform={{
                    position: {}
                }}
            />
            <Label
                value={InfoUI.publicKey}
                color={Color4.White()}
                fontSize={16}
                font="serif"
                textAlign="top-left"
                uiTransform={{
                    position: { top: "20px" }
                }}
            />
            <Label
                value={InfoUI.hasConnectedWeb3}
                color={Color4.White()}
                fontSize={16}
                font="serif"
                textAlign="top-left"
                uiTransform={{
                    position: { top: "40px" }
                }}
            />
            <Label
                value={InfoUI.userId}
                color={Color4.White()}
                fontSize={16}
                font="serif"
                textAlign="top-left"
                uiTransform={{
                    position: { top: "60px" }
                }}
            />
            <Label
                value="=============================================="
                color={Color4.Green()}
                fontSize={16}
                font="serif"
                textAlign="top-left"
                uiTransform={{
                    position: { top: "80px" }
                }}
            />
            <Label
                value={InfoUI.ethGasPrice}
                color={Color4.White()}
                fontSize={16}
                font="serif"
                textAlign="top-left"
                uiTransform={{
                    position: { top: "100px" }
                }}
            />
            <Label
                value={InfoUI.ethBalance}
                color={Color4.White()}
                fontSize={16}
                font="serif"
                textAlign="top-left"
                uiTransform={{
                    position: { top: "120px" }
                }}
            />
            <Label
                value="=============================================="
                color={Color4.Green()}
                fontSize={16}
                font="serif"
                textAlign="top-left"
                uiTransform={{
                    position: { top: "140px" }
                }}
            />


        </UiEntity>
    )

    static Render() {
        return [
            InfoUI.component()
        ]
    }

    static Show(): void {
        InfoUI.visibility = true
    }

    static Hide(): void {
        InfoUI.visibility = false
    }

    static updateUserData(userData: UserData) {
        InfoUI.displayName = "Display Name: " + userData.displayName
        InfoUI.publicKey = "Public key: " + userData.publicKey
        InfoUI.hasConnectedWeb3 = "Connected to Web3: " + userData.hasConnectedWeb3
        InfoUI.userId = "UserID: " + userData.userId
    }
    
    static updateEthGasPrice(price:string){
        InfoUI.ethGasPrice = "Eth gas price: " + price + " wei"
    } 
    
    static updateEthBalance(balance:string){
        InfoUI.ethBalance = "Eth balance: " + balance
    }
}