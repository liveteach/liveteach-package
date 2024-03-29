import { executeTask } from '@dcl/sdk/ecs'
import { createEthereumProvider } from '@dcl/sdk/ethereum-provider'
import { ContractFactory, RequestManager } from 'eth-connect'
import { GetSceneResponse, getSceneInfo } from '~system/Scene'
import { GetUserDataResponse, UserData, getUserData } from "~system/UserIdentity"
import teachAbi from "./contracts/TeachContractAbi.json"
import teacherAbi from "./contracts/TeacherContractAbi.json"
import worldsAbi from "./contracts/WorldsTeachContract.json"
import { getRealm } from '~system/Runtime'

import { ClassPacket } from "./types/classroomTypes"
import { InfoUI } from "./ui/infoUI"

class ClassContentData {
    public id: number;
    public teacher: string;
    public classReference: string;
    public contentUrl: string;

    constructor(id: number, teacher: string, classReference: string, contentUrl: string) {
        this.id = id;
        this.teacher = teacher;
        this.classReference = classReference;
        this.contentUrl = contentUrl;

    }
}

export class BlockChain {
    private readonly mainnetLiveTeachContractAddress: string = "0xb73829d24b6C26E9D94D3EF7A93bdAf22D5C8aF3";
    private readonly mainnetTeachersContractAddress: string = "0x49F6eB033953Ff757a9111D5E5E0D212ed84a37C";
    private readonly mainnetDclWorldsContractAddress: string = "<TO BE ADDED WHEN DEPLOYED>";

    private liveTeachContractAddress: string;
    private teachersContractAddress: string;

    public useDclWorlds: boolean = false;
    userData: UserData | undefined = undefined
    sceneBaseX: number = 1000
    sceneBaseZ: number = 1000

    // Optional parameters `liveTeachContractAddress` and `teachersContractAddress`.
    // Allows passing in a custom LiveTeach contract address.
    // Intended to be used for testnet contracts.
    // These values ignored unless you pass in both.
    // Defaults to mainnet.
    constructor(liveTeachContractAddress?: string, teachersContractAddress?: string, _useDclWorlds?: boolean) {
        if (_useDclWorlds) {
            this.useDclWorlds = _useDclWorlds;
        }

        if (liveTeachContractAddress && teachersContractAddress) {
            this.liveTeachContractAddress = liveTeachContractAddress;
            this.teachersContractAddress = teachersContractAddress;
        }
        else {
            if (this.useDclWorlds) {
                this.liveTeachContractAddress = this.mainnetDclWorldsContractAddress;
            }
            else {
                this.liveTeachContractAddress = this.mainnetLiveTeachContractAddress;
            }
            this.teachersContractAddress = this.mainnetTeachersContractAddress;
        }


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

    getBaseParcel(): [number, number] {
        return [this.sceneBaseX, this.sceneBaseZ]
    }

    getUserParcel(_x: number, _z: number): [number, number] {
        let worldPositionX = this.sceneBaseX + (_x / 16)
        let worldPositionZ = this.sceneBaseZ + (_z / 16)
        worldPositionX = Math.floor(worldPositionX)
        worldPositionZ = Math.floor(worldPositionZ)
        return [worldPositionX, worldPositionZ]
    }

    public async getUserWorld(): Promise<string> {
        const realm = await getRealm({})

        if(realm.realmInfo && realm.realmInfo.realmName) {
            let realmName = realm.realmInfo.realmName;
            return realmName.split(".")[0];
        }
        else {
            throw new Error("Unable to determine player realm");
        }
    }

    public async getClassroomGuid(input: [number, number] | string): Promise<string> {
        if (this.useDclWorlds) {
            return this.getDclWorldsClassroomGuid(input as string);
        }
        else {
            return this._getClassroomGuid(input as [number, number]);
        }
    }

    private async getDclWorldsClassroomGuid(worldName: string): Promise<string> {
        console.log("Getting worlds classroom guid", '"'+worldName+'"');
        try {
            if (this.userData && this.userData.hasConnectedWeb3) {
                const provider = createEthereumProvider()
                const requestManager = new RequestManager(provider)
                const factory = new ContractFactory(requestManager, worldsAbi)
                const contract = (await factory.at(
                    this.liveTeachContractAddress
                )) as any

                const res = await contract.getClassroomGuid(
                    worldName,
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

    private async _getClassroomGuid(_parcel: [number, number]): Promise<string> {
        try {
            if (this.userData && this.userData.hasConnectedWeb3) {
                console.log("wallet address", this.userData.publicKey)
                // create an instance of the web3 provider to interface with Metamask
                const provider = createEthereumProvider()
                // Create the object that will handle the sending and receiving of RPC messages
                const requestManager = new RequestManager(provider)
                // Create a factory object based on the abi
                const factory = new ContractFactory(requestManager, teachAbi)
                // Use the factory object to instance a `contract` object, referencing a specific contract
                const contract = (await factory.at(
                    this.liveTeachContractAddress
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

    public async getClassContentList(): Promise<ClassPacket[]> {
        try {
            if (this.userData && this.userData.hasConnectedWeb3) {
                const provider = createEthereumProvider()
                const requestManager = new RequestManager(provider)
                const factory = new ContractFactory(requestManager, teacherAbi)
                const contract = (await factory.at(
                    this.teachersContractAddress
                )) as any

                // get all ClassContent objects associated with this teacher
                const classContents: [ClassContentData] = await contract.getClassConfigs(
                    {
                        from: this.userData.publicKey,
                    }
                )

                const classContentsList: ClassPacket[] = []
                for (let i = 0; i < classContents.length; i++) {
                    const content: ClassContentData = classContents[i];
                    classContentsList.push({
                        id: content.id.toString(),
                        name: content.classReference,
                        description: "",
                        contentUrl: content.contentUrl
                    })
                }
                return classContentsList
            } else {
                console.log("Player is not connected with Web3")
                return []
            }
        } catch (error) {
            console.error(error)
            return []
        }
    }

    public async getClassContent(_contentUrl: string): Promise<string> {
        try {
            console.log("content url: " + _contentUrl)
            return await fetch(_contentUrl)
                .then(response => response.json())
                .then(json => {
                    if (json != null && json != undefined) {
                        console.log(json)
                        return json
                    }
                })
        } catch (error) {
            console.error(error)
            return ""
        }
    }
}