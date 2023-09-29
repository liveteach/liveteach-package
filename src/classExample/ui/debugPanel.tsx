import { Color4 } from "@dcl/sdk/math"
import ReactEcs, { Label, UiEntity } from "@dcl/sdk/react-ecs"
import { ClassroomManager } from "../classroomManager"

enum LogLevel {
    DEVELOPER,
    TEACHER,
    STUDENT
}

type ClassEvent = {
    message: string,
    color: Color4
}

export class DebugPanel {
    private static readonly DEV_MODE: boolean = false
    private static readonly LOG_LIMIT: number = 22

    private static visibility: boolean = false
    private static log: ClassEvent[] = []

    private static component = () => (
        <UiEntity
            uiTransform={{
                position: { right: '0px', bottom: '0px' },
                height: "500px",
                width: "380px",
                positionType: 'absolute',
                display: DebugPanel.visibility ? 'flex' : 'none'
            }}
            uiBackground={{ color: Color4.create(0, 0, 0, 0.8) }}
        >
            <UiEntity
                uiTransform={{
                    width: '100%',
                    height: '3%',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Label
                    value="DEBUG PANEL"
                    color={Color4.Green()}
                    fontSize={20}
                    font="serif"
                    textAlign="top-center"
                />
            </UiEntity>
            {DebugPanel.GennerateLog()}
        </UiEntity>
    )

    static Render() {
        return [
            DebugPanel.component()
        ]
    }

    static Show(): void {
        DebugPanel.visibility = true
    }

    static Hide(): void {
        DebugPanel.visibility = false
    }

    static LogClassEvent(_message: string, _color: Color4, _classroomGuid: string, _studentEvent: boolean): void {
        const logLevel = DebugPanel.GetLogLevel()

        if (logLevel == LogLevel.DEVELOPER || ((ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _classroomGuid) && (logLevel == LogLevel.TEACHER || (logLevel == LogLevel.STUDENT && _studentEvent)))) {
            if (DebugPanel.log.length >= DebugPanel.LOG_LIMIT) {
                DebugPanel.log.splice(0, 1)
            }
            DebugPanel.log.push({
                message: _message,
                color: _color
            })
        }
    }

    private static GennerateLog() {
        return DebugPanel.log.map((event, index) => <DebugPanel.LogEventComponent message={event.message} color={event.color} height={460 - (index * 20)} />)
    }

    private static LogEventComponent(props: { message: string, color: Color4, height: number }) {
        return <UiEntity
            uiTransform={{
                height: props.height,
                justifyContent: 'center',
                alignItems: 'flex-start',
                position: { left: '10px', bottom: '0px' },
                positionType: 'absolute',
            }}
        >
            <Label
                value={props.message}
                color={props.color}
                uiTransform={{ width: 0, height: 0, margin: 4 }}
                fontSize={14}
                font="serif"
                textAlign="top-left"
            />
        </UiEntity>
    }

    private static GetLogLevel(): LogLevel {
        return DebugPanel.DEV_MODE ? LogLevel.DEVELOPER : (ClassroomManager.classController?.isTeacher() ? LogLevel.TEACHER : LogLevel.STUDENT)
    }
}