import { IContentUnit } from "./IContentUnit"

export class ContentUnitManager {
    static units: Map<string, IContentUnit> = new Map<string, IContentUnit>
    static unitUIs: Map<string, Function> = new Map<string, Function>
    static activeUnit: IContentUnit | undefined = undefined

    static register(_key: string, _unit: IContentUnit, _ui?: Function): void {
        ContentUnitManager.units.set(_key, _unit)
        if (_ui) ContentUnitManager.unitUIs.set(_key, _ui)
    }

    static start(_key: string, _data: any): void {
        if (!ContentUnitManager.units.has(_key)) return

        ContentUnitManager.activeUnit = ContentUnitManager.units.get(_key)
        if (!ContentUnitManager.activeUnit) return

        ContentUnitManager.activeUnit.start(_data)
    }

    static end(): void {
        if (!ContentUnitManager.activeUnit) return

        ContentUnitManager.activeUnit.end()
        ContentUnitManager.activeUnit = undefined
    }

    static send(): void {
        if (!ContentUnitManager.activeUnit) return

        ContentUnitManager.activeUnit.send()
    }

    static receive(): void {
        if (!ContentUnitManager.activeUnit) return

        ContentUnitManager.activeUnit.receive()
    }

    static Render() {
        return Array(...ContentUnitManager.unitUIs).map(unitUI => unitUI[1]())
    }
}