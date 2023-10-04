import { ControllerUI } from './controllerUI'
import { DebugPanel } from './debugPanel'
import { InfoUI } from './infoUI'

export const classroomComponent = () => [
    InfoUI.Render(),
    ControllerUI.Render(),
    DebugPanel.Render()
]