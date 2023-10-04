import { ClassContent } from "../classroomObjects";

export abstract class ClassContentFactory {
    static Create(_config: string) : ClassContent {
        let classContent: ClassContent = Object.assign(new ClassContent(), JSON.parse(_config))
        return classContent
    }
}