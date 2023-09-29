import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { UiEntity, Label } from '@dcl/sdk/react-ecs'
import { UserData } from '~system/UserIdentity'
import { ControllerUI } from './controllerUI'
import { DebugPanel } from './debugPanel'

let displayName: string = ""
let publicKey: string = ""
let hasConnectedWeb3: string = ""
let userId: string = ""

let ethGasPrice: string = ""
let ethBalance: string = ""

export const classroomExampleComponent = () => [
    gameUI(),
    ControllerUI.Render(),
    DebugPanel.Render()
]

export function updateUserData(userData: UserData) {
    displayName = "Display Name: " + userData.displayName
    publicKey = "Public key: " + userData.publicKey
    hasConnectedWeb3 = "Connected to Web3: " + userData.hasConnectedWeb3
    userId = "UserID: " + userData.userId
}

export function updateEthGasPrice(price:string){
    ethGasPrice = "Eth gas price: " + price + " wei"
} 

export function updateEthBalance(balance:string){
    ethBalance = "Eth balance: " + balance
}


export const gameUI = () => (
    <UiEntity uiTransform={{
        display: 'flex',
        position: { right: '10px', top: '120px' },
        positionType: 'absolute',
        width: 500,
        height: 500
    }}
        uiBackground={{
            color: Color4.create(0, 0, 0, 0.9)
        }}>
        <Label
            value={displayName}
            color={Color4.White()}
            fontSize={16}
            font="serif"
            textAlign="top-left"
            uiTransform={{
                position: {}
            }}
        />
        <Label
            value={publicKey}
            color={Color4.White()}
            fontSize={16}
            font="serif"
            textAlign="top-left"
            uiTransform={{
                position: { top: "20px" }
            }}
        />
        <Label
            value={hasConnectedWeb3}
            color={Color4.White()}
            fontSize={16}
            font="serif"
            textAlign="top-left"
            uiTransform={{
                position: { top: "40px" }
            }}
        />
        <Label
            value={userId}
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
            value={ethGasPrice}
            color={Color4.White()}
            fontSize={16}
            font="serif"
            textAlign="top-left"
            uiTransform={{
                position: { top: "100px" }
            }}
        />
        <Label
            value={ethBalance}
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