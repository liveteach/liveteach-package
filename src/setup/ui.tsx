import { classroomComponent } from "../classroom/ui/ui";
import { seatingUIComponent } from "../seating/ui";

export const Render = () => (
  [
    seatingUIComponent,
    classroomComponent()
    // Add extra UI here
  ]
)