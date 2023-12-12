import { Color4 } from "@dcl/sdk/math"
import ReactEcs, { Button, Label, UiEntity } from "@dcl/sdk/react-ecs"
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
    private static startIndex: number = 0

    private static component = () => (
        <UiEntity
            uiTransform={{
                position: { right: '0px', bottom: '0px' },
                height: "500px",
                width: "380px",
                positionType: 'absolute',
                display: 'flex'
            }}
        >
            <UiEntity
                uiTransform={{
                    position: { right: '0px', bottom: '0px' },
                    height: "50px",
                    width: "150",
                    positionType: 'absolute',
                    display: 'flex'
                }}
            >
                <Button
                    value={"DEBUG PANEL"}
                    fontSize={16}
                    color={Color4.White()}
                    variant='primary'
                    uiTransform={{ width: 150, height: 50, margin: 0 }}
                    onMouseDown={() => { DebugPanel.visibility ? DebugPanel.Hide() : DebugPanel.Show() }}
                />
            </UiEntity>
            <UiEntity
                uiTransform={{
                    position: { right: '0px', bottom: '50px' },
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
                    <UiEntity
                        uiTransform={{
                            position: { right: '350px', bottom: '-60px' },
                            height: "30px",
                            width: "30px",
                            positionType: 'absolute',
                            display: DebugPanel.startIndex > 0 ? 'flex' : 'none'
                        }}
                        uiBackground={{
                            textureMode: 'stretch',
                            texture: {
                                src: "images/ui/button-up.png"
                            }
                        }}
                        onMouseDown={() => { DebugPanel.MoveUp() }}
                    >
                    </UiEntity>
                    <UiEntity
                        uiTransform={{
                            position: { right: '350px', bottom: '-485px' },
                            height: "30px",
                            width: "30px",
                            positionType: 'absolute',
                            display: DebugPanel.startIndex < (DebugPanel.log.length - DebugPanel.LOG_LIMIT) ? 'flex' : 'none'
                        }}
                        uiBackground={{
                            textureMode: 'stretch',
                            texture: {
                                src: "images/ui/button-down.png"
                            }
                        }}
                        onMouseDown={() => { DebugPanel.MoveDown() }}
                    >
                    </UiEntity>
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

    static LogClassEvent(_message: string, _color: Color4, _classroomGuid: string, _studentEvent: boolean, _global: boolean): void {
        const logLevel = DebugPanel.GetLogLevel()

        if (logLevel == LogLevel.DEVELOPER || ((_global || (ClassroomManager.activeClassroom && ClassroomManager.activeClassroom.guid == _classroomGuid)) && ((logLevel == LogLevel.TEACHER && !_studentEvent) || (logLevel == LogLevel.STUDENT && _studentEvent)))) {
            DebugPanel.log.push({
                message: _message,
                color: _color
            })
            if (DebugPanel.log.length > DebugPanel.LOG_LIMIT) {
                DebugPanel.startIndex = DebugPanel.log.length - DebugPanel.LOG_LIMIT
            }
        }
    }

    private static MoveUp(): void {
        DebugPanel.startIndex = Math.max(0, DebugPanel.startIndex - 1)
    }

    private static MoveDown(): void {
        DebugPanel.startIndex = Math.min(DebugPanel.log.length - DebugPanel.LOG_LIMIT, DebugPanel.startIndex + 1)
    }

    private static GennerateLog() {
        let filteredLog: ClassEvent[] = []
        for (let i = 0; i < DebugPanel.log.length; i++) {
            if (i >= DebugPanel.startIndex && i < DebugPanel.startIndex + DebugPanel.LOG_LIMIT) {
                filteredLog.push(DebugPanel.log[i])
            }
        }
        return filteredLog.map((event, index) => <DebugPanel.LogEventComponent message={event.message} color={event.color} height={460 - (index * 20)} />)
    }

    private static LogEventComponent(props: { message: string, color: Color4, height: number }) {
        return <UiEntity
            uiTransform={{
                height: props.height,
                justifyContent: 'center',
                alignItems: 'flex-start',
                position: { left: '30px', bottom: '0px' },
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