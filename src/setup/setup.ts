
export class GlobalData {
  static engine: any
  static Transform: any
  static TextShape: any
  static MeshRenderer: any
  static MeshCollider: any
  static Material: any
  static GltfContainer: any
  static Animator: any
  static PointerEvents: any
  static PointerEventsSystem: any
  static inputSystem: any
  static Logger: any
  static executeTask: any
  static AvatarModifierArea: any
  static AvatarModifierType: any
}

type GlobalDataConfig = {
  ecs: any;
  Logger: any;
}

export function setup(data: GlobalDataConfig): void {
  GlobalData.engine = data.ecs.engine
  GlobalData.Transform = data.ecs.Transform
  GlobalData.TextShape = data.ecs.TextShape
  GlobalData.MeshRenderer = data.ecs.MeshRenderer
  GlobalData.MeshCollider = data.ecs.MeshCollider
  GlobalData.Material = data.ecs.Material
  GlobalData.GltfContainer = data.ecs.GltfContainer
  GlobalData.Animator = data.ecs.Animator
  GlobalData.PointerEvents = data.ecs.PointerEvents
  GlobalData.PointerEventsSystem = data.ecs.pointerEventsSystem
  GlobalData.inputSystem = data.ecs.inputSystem
  GlobalData.Logger = data.Logger
  GlobalData.executeTask = data.ecs.executeTask
  GlobalData.AvatarModifierArea = data.ecs.AvatarModifierArea
  GlobalData.AvatarModifierType = data.ecs.AvatarModifierType


}