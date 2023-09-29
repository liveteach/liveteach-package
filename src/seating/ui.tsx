import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { Label, ReactEcsRenderer, UiEntity } from '@dcl/sdk/react-ecs'
import * as UI from 'dcl-ui-toolkit'
import { AnimationHelper } from './animationHelper'
import { SeatManager } from './seatManager'
import { User, UserManager } from './user'
import { UserType } from '../enums'

export const announcement = (UI.createComponent(UI.Announcement, { value: 'Seat already taken', duration: 2 }))

export function isStudentUIVisisble(){
  if (SeatManager.seated) {
    return 'flex'
  } else {
    return 'none'
  }
}

export function isTeacherUIVisisble(){
  if(UserManager.myself == undefined){
    return 'none'
  }
  if (UserManager.myself.userType == UserType.teacher) {
    return 'flex'
  } else {
    return 'none'
  }
}

export const seatingUIComponent = () => (
  [
    UI.render(),
    StudentUI(),
    TeacherUI()
  ]
)

export const StudentUI = () => (
  <UiEntity
  key="StudentContainer"
  uiTransform={{
    positionType: "absolute",
    height:400,
    width:200,
    position: {top:150, right:20},
    alignContent:"center",
    flexDirection: "column",
    display: isStudentUIVisisble()
}}
  uiBackground={{
    color: Color4.create(0,0,0,0.5)
  }}
  > 
    <UiEntity
      key="StudentLabelContainer"
      uiTransform={{
        position: {top:20},
        width:"100%", 
        height:50,
      }}
      >
    <Label
      key="StudentLabel"
      value="Student"
      fontSize={24}
      uiTransform={{
        width:"100%"
      }}
      textAlign="middle-center"
      
    /> 
    </UiEntity>
    <UiEntity
      key="sitButton"
      uiTransform={{
        position: {top:50,left:20},
        width:160,
        height:50,
      }}
      uiBackground={{
        color: Color4.create(0.5,0,0,1)
      }}
      onMouseDown={AnimationHelper.sit}
    >
      <Label
        key="sitLabel"
        value="Sit Down"
        fontSize={24}
        uiTransform={{
          width:"100%",
        }}
      />
    </UiEntity>
    <UiEntity
      key="handUpButton"
      uiTransform={{
        position: {top:60,left:20},
        width:160,
        height:50,
      }}
      uiBackground={{
        color: Color4.create(0.5,0,0,1)
      }}
      onMouseDown={AnimationHelper.handUp}
    >
      <Label
        key="handUpLabel"
        value="Hand Up"
        fontSize={24}
        uiTransform={{
          width:"100%",
        }}
      />
    </UiEntity>


  </UiEntity>
)

export const TeacherUI = () => (
  <UiEntity
  key="TeacherContainer"
  uiTransform={{
    positionType: "absolute",
    height:400,
    width:200,
    position: {top:150, right:20},
    alignContent:"center",
    flexDirection: "column",
    display: isTeacherUIVisisble()
}}
  uiBackground={{
    color: Color4.create(0,0,0,0.5)
  }}
  > 
    <UiEntity
      key="TeacherLabelContainer"
      uiTransform={{
        position: {top:20},
        width:"100%", 
        height:50,
      }}
      >
    <Label
      key="TeacherLabel"
      value="Teacher"
      fontSize={24}
      uiTransform={{
        width:"100%"
      }}
      textAlign="middle-center"
      
    /> 
    </UiEntity>
    <UiEntity
      key="sitButton"
      uiTransform={{
        position: {top:50,left:20},
        width:160,
        height:50,
      }}
      uiBackground={{
        color: Color4.create(0.5,0,0,1)
      }}
      onMouseDown={AnimationHelper.sit}
    >
      <Label
        key="sitLabel"
        value="Sit Down"
        fontSize={24}
        uiTransform={{
          width:"100%",
        }}
      />
    </UiEntity>
    <UiEntity
      key="handUpButton"
      uiTransform={{
        position: {top:60,left:20},
        width:160,
        height:50,
      }}
      uiBackground={{
        color: Color4.create(0.5,0,0,1)
      }}
      onMouseDown={AnimationHelper.handUp}
    >
      <Label
        key="handUpLabel"
        value="Hand Up"
        fontSize={24}
        uiTransform={{
          width:"100%",
        }}
      />
    </UiEntity>


  </UiEntity>
)