
import { GetUserDataResponse, UserData, getUserData } from "~system/UserIdentity"
import { RequestManager, ContractFactory } from 'eth-connect'
import { createEthereumProvider } from '@dcl/sdk/ethereum-provider'
import { Entity, InputAction, MeshCollider, MeshRenderer, Transform, executeTask, pointerEventsSystem, } from '@dcl/sdk/ecs'
import landABI from "./contracts/LANDRegistry.json"
import estateABI from "./contracts/EstateRegistry.json"
import { Vector3 } from "@dcl/sdk/math"
import { TextEncoder } from 'text-encoding'
import { InfoUI } from "./ui/infoUI"

export class BlockChain {
    userData: UserData

    constructor() {
        Object.assign(globalThis, {
            TextEncoder: TextEncoder
        })
        this.getUserData()
        this.getGasPrice()
    }

    createSphere() {
        let startClassEntity: Entity
        MeshRenderer.setSphere(startClassEntity)
        MeshCollider.setSphere(startClassEntity)
        Transform.create(startClassEntity, {
            position: Vector3.create(8, 1.5, 8)
        })

        pointerEventsSystem.onPointerDown(
            {
                entity: startClassEntity,
                opts: {
                    button: InputAction.IA_POINTER,
                    hoverText: 'Start Class'
                }
            },
            () => {
                //this.startClass()
                //this.decodeTokenId()
                this.setLandUpdateOperator()
            }
        )
    }

    getUserData() {
        executeTask(async () => {
            await getUserData({}).then((userData: GetUserDataResponse) => {
                if (userData != undefined) {
                    if (userData.data != undefined) {
                        this.userData = userData.data
                        if (userData.data.hasConnectedWeb3) {
                            console.log(userData.data.publicKey)
                            InfoUI.updateUserData(userData.data)
                            this.getEthBalance()
                            this.createSphere()
                        } else {
                            console.log("Player is not connected with Web3")
                        }
                    }
                }
            })
        })
    }

    getGasPrice() {
        executeTask(async function () {
            // create an instance of the web3 provider to interface with Metamask
            const provider = createEthereumProvider()
            // Create the object that will handle the sending and receiving of RPC messages
            const requestManager = new RequestManager(provider)
            // Check the current gas price on the Ethereum network
            const gasPrice = await requestManager.eth_gasPrice()
            // log response
            InfoUI.updateEthGasPrice(gasPrice.toString())
            console.log({ gasPrice })
        })
    }

    getEthBalance() {
        executeTask(async () => {
            // create an instance of the web3 provider to interface with Metamask
            const provider = createEthereumProvider()
            // Create the object that will handle the sending and receiving of RPC messages
            const requestManager = new RequestManager(provider)

            requestManager.eth_getBalance(this.userData.publicKey, await requestManager.eth_blockNumber()).then((data) => {
                let number = data.toNumber() / 1000000000000000000
                InfoUI.updateEthBalance(number.toString())
            })
        })
    }

    startClass() {
        executeTask(async () => {
            // create an instance of the web3 provider to interface with Metamask
            const provider = createEthereumProvider()
            // Create the object that will handle the sending and receiving of RPC messages
            const requestManager = new RequestManager(provider)

            requestManager.eth_sendTransaction({
                from: this.userData.publicKey,
                to: this.userData.publicKey,
                data: "Test"
            })
        })
    }

    decodeTokenId() {
        executeTask(async () => {
            // create an instance of the web3 provider to interface with Metamask
            const provider = createEthereumProvider()
            // Create the object that will handle the sending and receiving of RPC messages
            const requestManager = new RequestManager(provider)
            const factory = new ContractFactory(requestManager, landABI)
            const contract = (await factory.at("0x554bb6488ba955377359bed16b84ed0822679cdc")) as any

            const result = await contract.decodeTokenId(
                '115792089237316195423570985008687907811415253534365133033462507293805639630971'
            )
            console.log(result)
        })
    }

    setLandUpdateOperator() {
        executeTask(async () => {
            // create an instance of the web3 provider to interface with Metamask
            const provider = createEthereumProvider()
            // Create the object that will handle the sending and receiving of RPC messages
            const requestManager = new RequestManager(provider)
            const factory = new ContractFactory(requestManager, estateABI)
            const contract = (await factory.at("0x959e104e1a4db6317fa58f8295f586e1a978c297")) as any

            // set LandUpdateOperator to Burner wallet on -150,150
            const result = await contract.setLandUpdateOperator(1186,
                '115792089237316195423570985008687907802227629627499794519951392893147897921686',
                '0x560955D890e715c0F2940349f24594F5712bb78D',
                {
                    from: this.userData.publicKey,
                    value: 0
                }
            )
            console.log(result)
        })
    }

}