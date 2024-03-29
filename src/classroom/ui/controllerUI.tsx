import { Color4 } from "@dcl/sdk/math"
import ReactEcs, { Button, Label, UiEntity } from "@dcl/sdk/react-ecs"
import { ClassroomManager } from "../classroomManager";

export class ControllerUI {
    private static visibility: boolean = false

    private static component = () => (
        <UiEntity
            uiTransform={{
                position: { left: '0px', bottom: '380px' },
                height: "180px",
                width: "380px",
                positionType: 'absolute',
                display: ControllerUI.visibility && (ClassroomManager.classController?.isTeacher() || (ClassroomManager.classController?.isStudent() && ClassroomManager.classController?.classList.length > 0 && ClassroomManager.GetClassroomConfig()?.classroom.autojoin == false)) ? 'flex' : 'none'
            }}
            uiBackground={{ color: Color4.create(0, 0, 0, 0.8) }}
        >
            <UiEntity // CONTROLS
                uiTransform={{
                    position: { left: "10px", top: "10px" },
                    height: "200px",
                    width: "300px",
                    positionType: 'absolute',
                    display: "flex"
                }}
            >
                <Label
                    value={(ClassroomManager.classController?.isTeacher() ? "TEACHER" : "STUDENT") + " CONTROLS"}
                    color={Color4.Green()}
                    uiTransform={{ width: 80, height: 40, margin: 4 }}
                    fontSize={20}
                    font="serif"
                    textAlign="top-left"
                />
            </UiEntity>
            <UiEntity // CLASS SELECTION - TEACHER ONLY
                uiTransform={{
                    position: { left: "10px", top: "60px" },
                    height: "200px",
                    width: "500px",
                    positionType: 'absolute',
                    display: ClassroomManager.classController?.isTeacher() && ClassroomManager.classController?.classList?.length > 0 ? "flex" : "none"
                }}
            >
                <Button
                    value="<"
                    fontSize={16}
                    color={Color4.Black()}
                    variant={ControllerUI.CanPrevClass() ? 'primary' : 'secondary'}
                    uiTransform={{ width: 40, height: 40, margin: 4 }}
                    onMouseDown={() => { ControllerUI.PrevClass() }}
                />
                <Button
                    value={ControllerUI.GetSelectedClass()}
                    fontSize={16}
                    color={Color4.Black()}
                    variant='secondary'
                    uiTransform={{ width: 260, height: 40, margin: 4 }}
                />
                <Button
                    value=">"
                    fontSize={16}
                    color={Color4.Black()}
                    variant={ControllerUI.CanNextClass() ? 'primary' : 'secondary'}
                    uiTransform={{ width: 40, height: 40, margin: 4 }}
                    onMouseDown={() => { ControllerUI.NextClass() }}
                />
            </UiEntity>
            <UiEntity // CLASS DISPLAY - STUDENT ONLY
                uiTransform={{
                    position: { left: "105px", top: "60px" },
                    height: "200px",
                    width: "500px",
                    positionType: 'absolute',
                    display: ClassroomManager.classController?.isStudent() && ClassroomManager.classController?.classList?.length > 0 ? "flex" : "none"
                }}
            >
                <Label
                    value={"Available class: " + ControllerUI.GetSelectedClass()}
                    fontSize={16}
                    color={Color4.Green()}
                    uiTransform={{ width: 40, height: 40, margin: 4 }}
                    onMouseDown={() => { ControllerUI.PrevClass() }}
                />
            </UiEntity>
            <UiEntity // START CLASS / JOIN CLASS
                uiTransform={{
                    position: { left: "10px", top: "110px" },
                    height: "200px",
                    width: "500px",
                    positionType: 'absolute',
                    display: ClassroomManager.classController?.classList?.length > 0 ? "flex" : "none"
                }}
            >
                <Button
                    value={ClassroomManager.classController?.isTeacher() ? (ClassroomManager.classController?.inSession ? "End Class" : "Start Class") : (ClassroomManager.classController?.isInClass() ? "Exit Class" : "Join Class")}
                    fontSize={16}
                    color={Color4.Black()}
                    variant={(ClassroomManager.classController?.isTeacher() && ClassroomManager.classController?.inSession) || (ClassroomManager.classController?.isStudent() && ClassroomManager.classController?.isInClass()) ? 'primary' : 'secondary'}
                    uiTransform={{ width: 160, height: 40, margin: 4 }}
                    onMouseDown={() => { ClassroomManager.classController?.isTeacher() ? ControllerUI.ToggleStartClass() : ControllerUI.ToggleJoinClass() }}
                />
            </UiEntity>
        </UiEntity>
    )

    private static GetSelectedClass(): string {
        if (ClassroomManager.classController && ClassroomManager.classController.classList.length > 0) {
            return ClassroomManager.classController.classList[ClassroomManager.classController.selectedClassIndex].name
        }
        return ""
    }

    private static CanPrevClass(): boolean {
        if (ClassroomManager.classController && ClassroomManager.classController.selectedClassIndex > 0) {
            return true
        }
        return false
    }

    private static CanNextClass(): boolean {
        if (ClassroomManager.classController && ClassroomManager.classController.selectedClassIndex < ClassroomManager.classController.classList.length - 1) {
            return true
        }
        return false
    }

    private static PrevClass(): void {
        if (ControllerUI.CanPrevClass()) {
            ClassroomManager.classController.selectedClassIndex--
            if (ClassroomManager.classController?.isTeacher()) {
                if (ClassroomManager.classController.inSession) {
                    ClassroomManager.classController.endClass()
                }
                ClassroomManager.classController.setClassroom()
            }
            else {
                if (ClassroomManager.classController.isInClass()) {
                    ClassroomManager.classController.exitClass()
                }
            }
        }
    }

    private static NextClass(): void {
        if (ControllerUI.CanNextClass()) {
            ClassroomManager.classController.selectedClassIndex++
            if (ClassroomManager.classController?.isTeacher()) {
                if (ClassroomManager.classController.inSession) {
                    ClassroomManager.classController.endClass()
                }
                ClassroomManager.classController.setClassroom()
            }
            else {
                if (ClassroomManager.classController.isInClass()) {
                    ClassroomManager.classController.exitClass()
                }
            }
        }
    }

    private static ToggleStartClass(): void {
        if (ClassroomManager.classController.inSession) {
            ClassroomManager.classController.endClass()
        }
        else {
            ClassroomManager.classController.startClass()
        }
    }

    private static ToggleJoinClass(): void {
        if (ClassroomManager.classController.isInClass()) {
            ClassroomManager.classController.exitClass()
        }
        else {
            ClassroomManager.classController.joinClass()
        }
    }

    static Render() {
        return [
            ControllerUI.component()
        ]
    }

    static Show(): void {
        ControllerUI.visibility = true
    }

    static Hide(): void {
        ControllerUI.visibility = false
    }
}