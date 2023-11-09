import {IClassroomChannel} from "./IClassroomChannel";
import {ServerParams} from "../types/classroomTypes";

export interface IServerChannel extends IClassroomChannel{
    serverConfig(params:ServerParams):void;
}