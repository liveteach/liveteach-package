import { classroomComponent } from "../classroom/ui/ui";
import { ContentUnitUI } from "../contentUnits/ui";
import { ToastUI } from "../notifications/Toaster";
import { seatingUIComponent } from "../seating/ui";

export const Render = () => (
  [
    seatingUIComponent,
    classroomComponent(),
    ToastUI(),
    ContentUnitUI()
    // Add extra UI here
  ]
)