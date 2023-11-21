import { GetUserDataResponse, UserData, getUserData } from "~system/UserIdentity"
import { RequestManager, ContractFactory } from 'eth-connect'
import { createEthereumProvider } from '@dcl/sdk/ethereum-provider'
import { executeTask } from '@dcl/sdk/ecs'
import { InfoUI } from "./ui/infoUI"
import { GetSceneResponse, getSceneInfo } from '~system/Scene'
import abi from "./contracts/TeachContractAbi.json"

export class BlockChain {
    public readonly UAT_SMART_CONTRACT_ADDRESS: string = "0x31Cd6F96EFf5256aFBe1F66E846D04016A35C615";

    userData: UserData | undefined = undefined
    sceneBaseX: number = 1000
    sceneBaseZ: number = 1000

    constructor() {
        this.getUserData()
        this.getSceneData()
        //this.getGasPrice()

    }

    getUserData() {
        executeTask(async () => {
            await getUserData({}).then((userData: GetUserDataResponse) => {
                if (userData != undefined) {
                    if (userData.data != undefined) {
                        this.userData = userData.data
                        console.log("UserId: " + this.userData.userId)
                        if (userData.data.hasConnectedWeb3) {
                            console.log(userData.data.publicKey)
                            InfoUI.updateUserData(userData.data)
                            //this.getEthBalance()
                        } else {
                            console.log("Player is not connected with Web3")
                        }
                    }
                }
            })
        })
    }

    getSceneData() {
        executeTask(async () => {
            let sceneInfo: GetSceneResponse = await getSceneInfo({});
            if (!sceneInfo || !sceneInfo.metadata) {
                throw new Error('Cannot get scene info');
            }
            let parsedMetaData: any = JSON.parse(sceneInfo.metadata)
            if (!parsedMetaData || !parsedMetaData.scene || !parsedMetaData.scene.base) {
                throw new Error('Cannot get scene info from parsed metadata');
            }
            let parcel: string = parsedMetaData.scene.base
            let sceneBaseArr = parcel.split(",")
            this.sceneBaseX = parseInt(sceneBaseArr[0])
            this.sceneBaseZ = parseInt(sceneBaseArr[1])
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

            requestManager.eth_getBalance(this.userData?.publicKey ?? "", await requestManager.eth_blockNumber()).then((data) => {
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
                from: this.userData?.publicKey ?? "",
                to: this.userData?.publicKey ?? "",
                data: "Test"
            })
        })
    }

    getUserParcel(_x: number, _z: number): [number, number] {
        let worldPositionX = this.sceneBaseX + (_x / 16)
        let worldPositionZ = this.sceneBaseZ + (_z / 16)
        worldPositionX = Math.floor(worldPositionX)
        worldPositionZ = Math.floor(worldPositionZ)
        return [worldPositionX, worldPositionZ]
    }

    public async getClassroomGuid(_parcel: [number, number]): Promise<string> {
        try {
            if (this.userData && this.userData.hasConnectedWeb3) {
                console.log("wallet address", this.userData.publicKey)
                // create an instance of the web3 provider to interface with Metamask
                const provider = createEthereumProvider()
                // Create the object that will handle the sending and receiving of RPC messages
                const requestManager = new RequestManager(provider)
                // Create a factory object based on the abi
                const factory = new ContractFactory(requestManager, abi)
                // Use the factory object to instance a `contract` object, referencing a specific contract
                const contract = (await factory.at(
                    "0x3185cafec6fc18267ac92f83ffc8f08658519097"
                )) as any

                const res = await contract.getClassroomGuid(
                    _parcel[0], _parcel[1],
                    {
                        from: this.userData.publicKey,
                    }
                )
                // Log response
                console.log("Classroom Guid", res)

                return res as string
            } else {
                console.log("Player is not connected with Web3")
                return ""
            }
        } catch (error) {
            console.error(error)
            return ""
        }
    }
}