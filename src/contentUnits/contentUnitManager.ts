import { IContentUnit } from "./IContentUnit"

export class ContentUnitManager {
    static units: Map<string, IContentUnit> = new Map<string, IContentUnit>
    static activeUnit: IContentUnit | undefined = undefined
    static activeUnitKey: string = ""
    static activeUnitData: any

    static register(_key: string, _unit: IContentUnit): void {
        ContentUnitManager.units.set(_key, _unit)
    }

    static start(_key: string, _data: any): void {
        if (!ContentUnitManager.units.has(_key)) return

        ContentUnitManager.activeUnit = ContentUnitManager.units.get(_key)
        if (!ContentUnitManager.activeUnit) return

        ContentUnitManager.activeUnit.start(_data)
        ContentUnitManager.activeUnitKey = _key
        ContentUnitManager.activeUnitData = _data
    }

    static end(): void {
        if (!ContentUnitManager.activeUnit) return

        ContentUnitManager.activeUnit.end()
        ContentUnitManager.activeUnit = undefined
    }

    static update(_data: any): void {
        if (!ContentUnitManager.activeUnit) return

        ContentUnitManager.activeUnit.update(_data)
    }
}