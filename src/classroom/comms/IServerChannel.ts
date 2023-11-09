import {IClassroomChannel} from "./IClassroomChannel";

export interface IServerChannel extends IClassroomChannel{
    serverConfig(params);
}