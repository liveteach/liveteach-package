import { classroomComponent } from "../classroom/ui/ui";
import { ToastUI } from "../notifications/Toaster";
import { seatingUIComponent } from "../seating/ui";

export const Render = () => (
  [
    seatingUIComponent,
    classroomComponent(),
    ToastUI()
    // Add extra UI here
  ]
)