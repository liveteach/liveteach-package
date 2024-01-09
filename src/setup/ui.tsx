import { classroomComponent } from "../classroom/ui/ui";
import { ToastUI } from "../notifications/Toaster";

export const Render = () => (
  [
    classroomComponent(),
    ToastUI()
    // Add extra UI here
  ]
)