// @ts-nocheck
import { ClassController } from "./classroomControllers/classController";
import { ClassControllerFactory } from "./factories/classControllerFactory";
import { SmartContractManager } from "./smartContractManager";
import { CommunicationManager } from "./comms/communicationManager";
import { Classroom, ClassContent } from "./types/classroomTypes";
import { ClassroomFactory } from "./factories/classroomFactory";
import { UserDataHelper } from "./userDataHelper";
import { UserType } from "../enums";
import { IClassroomChannel } from "./comms/IClassroomChannel";
import { Entity, Transform, engine } from "@dcl/sdk/ecs";
import { Quaternion, Vector3 } from "@dcl/sdk/math";
import { ImageContentConfig, ScreenManager, VideoContentConfig, ModelContentConfig } from "../classroomContent";
import { ContentUnitManager } from "../contentUnits/contentUnitManager";
import { IContentUnit } from "../contentUnits/IContentUnit"
import { MediaContentType } from "../classroomContent/enums";

export abstract class ClassroomManager {
    static screenManager: ScreenManager
    static classController: ClassController
    static activeClassroom: Classroom | null = null
    static activeContent: ClassContent = null
    static requestingJoinClass: boolean = false
    static originEntity: Entity
    static testMode: boolean = false
    static classroomConfigs: any[] = []

    /**
     * Initialises the ClassroomManager.
     *
     * @param _channel the classroom channel used for communication.
     * @param _testMode optional parameter to enable test mode.
     */
    static Initialise(_channel: IClassroomChannel, liveTeachContractAddress?: string, teachersContractAddress?: string, _testMode: boolean = false): void {
        ClassroomManager.testMode = _testMode

        SmartContractManager.Initialise(liveTeachContractAddress, teachersContractAddress)
        CommunicationManager.Initialise(_channel)
        ClassroomManager.screenManager = new ScreenManager()

        // Set the user as student by default
        ClassroomManager.SetClassController(UserType.student)

        ClassroomManager.originEntity = engine.addEntity()
        Transform.create(ClassroomManager.originEntity, {
            position: Vector3.Zero()
        })
    }

    /**
     * Sets the contract guid used for testing.
     *
     * @param _guid the test contract guid.
     */
    static SetTestContractGuid(_guid: string): void {
        SmartContractManager.SetTestContractGuid(_guid)
    }

    /**
     * Adds a wallet address to the test teacher addresses
     *
     * @param _address user wallet address.
     */
    static AddTestTeacherAddress(_address: string): void {
        SmartContractManager.AddTestTeacherAddress(_address)
    }

    /**
     * Registers a classroom.
     *
     * @param _classroomConfig the classroom config json.
     */
    static RegisterClassroom(_classroomConfig: any): void {
        ClassroomManager.classroomConfigs.push(_classroomConfig)
    }

    /**
     * Gets the classroom config based on the user's position. If no config matches, null is returned.
     */
    static GetClassroomConfig(): any | null {
        const userPosition = Transform.get(engine.PlayerEntity).position

        for (let config of ClassroomManager.classroomConfigs) {
            const origin = config.classroom.origin
            const volume = config.classroom.volume
            if ((userPosition.x > origin.x - (0.5 * volume.x)) && (userPosition.x < origin.x + (0.5 * volume.x))
                && (userPosition.y > origin.y - (0.5 * volume.y)) && (userPosition.y < origin.y + (0.5 * volume.y))
                && (userPosition.z > origin.z - (0.5 * volume.z)) && (userPosition.z < origin.z + (0.5 * volume.z))) {
                return config
            }
        }
        return null
    }

    /**
     * Adds a screen for image/video display.
     *
     * @param _position the screen position.
     * @param _rotation the screen rotation.
     * @param _scale the screen scale.
     * @param _parent the screen's parent entity (optional parameter).
     */
    static AddScreen(_guid: string, _position: Vector3, _rotation: Quaternion, _scale: Vector3, _parent?: Entity): void {
        ClassroomManager.screenManager.addScreen(_guid, _position, _rotation, _scale, _parent)
    }

    /**
     * Sets the user's class controller.
     *
     * @param _type the user type, i.e teacher or student.
     */
    static SetClassController(_type: UserType): void {
        if (ClassroomManager.classController && ClassroomManager.classController.isTeacher() && _type === UserType.teacher) return
        if (ClassroomManager.classController && ClassroomManager.classController.isStudent() && _type === UserType.student) return

        if (ClassroomManager.classController && ClassroomManager.classController.inSession && ClassroomManager.classController.isTeacher() && _type === UserType.student) {
            ClassroomManager.EndClass()
        }

        if (ClassroomManager.classController && ClassroomManager.classController.inSession && ClassroomManager.classController.isStudent() && _type === UserType.teacher) {
            ClassroomManager.classController.exitClass()
        }

        ClassroomManager.classController = ClassControllerFactory.Create(_type)
    }

    /**
     * Fetches and sets the teacher's class content.
     *
     * @param _id the id of the class/course.
     */
    static async SetTeacherClassContent(_id: string): Promise<void> {
        SmartContractManager.FetchClassContent(_id)
            .then(function (classContent) {
                const config = ClassroomManager.GetClassroomConfig()

                if (config) {
                    ClassroomManager.activeContent = classContent
                    ClassroomManager.activeClassroom = ClassroomFactory.CreateTeacherClassroom(JSON.stringify(config.classroom), ClassroomManager.activeContent.name, ClassroomManager.activeContent.description)

                    let originEntityTransform = Transform.getMutableOrNull(ClassroomManager.originEntity)
                    if (originEntityTransform) {
                        originEntityTransform.position = config.classroom.origin
                    }

                    ClassroomManager.screenManager.loadContent()
                }
            })
    }

    /**
     * Starts a class. Called by the teacher.
     */
    static async StartClass(): Promise<void> {
        CommunicationManager.EmitClassStart({
            id: ClassroomManager.activeClassroom.guid, //use the class guid for students instead of the active content id
            name: ClassroomManager.activeContent.name,
            description: ClassroomManager.activeContent.description
        })
    }

    /**
     * Ends a class. Called by the teacher.
     */
    static async EndClass(): Promise<void> {
        CommunicationManager.EmitClassEnd({
            id: ClassroomManager.activeClassroom.guid, //use the class guid for students instead of the active content id
            name: ClassroomManager.activeContent.name,
            description: ClassroomManager.activeContent.description
        })

        if (ClassroomManager.screenManager.poweredOn) {
            ClassroomManager.screenManager.videoContent?.stop()
            ClassroomManager.screenManager.hideContent()
        }
    }

    /**
     * Joins the currently selected class. Called by students.
     * If autojoin is enabled in the classroom config, it joins the class that's been started by the teacher.
     */
    static JoinClass(): void {
        ClassroomManager.requestingJoinClass = true

        CommunicationManager.EmitClassJoin({
            id: ClassroomManager.classController.classList[ClassroomManager.classController.selectedClassIndex].id,
            name: ClassroomManager.classController.classList[ClassroomManager.classController.selectedClassIndex].name,
            description: ClassroomManager.classController.classList[ClassroomManager.classController.selectedClassIndex].description,
            studentID: UserDataHelper.GetUserId(),
            studentName: UserDataHelper.GetDisplayName()
        })
    }

    /**
     * Exits the class we're currently in. Called by students.
     */
    static ExitClass(): void {
        if (ClassroomManager.activeClassroom) {
            CommunicationManager.EmitClassExit({
                id: ClassroomManager.activeClassroom.guid,
                name: ClassroomManager.activeClassroom.className,
                description: ClassroomManager.activeClassroom.classDescription,
                studentID: UserDataHelper.GetUserId(),
                studentName: UserDataHelper.GetDisplayName()
            })
            ClassroomManager.activeClassroom = null

            if (ClassroomManager.screenManager.poweredOn) {
                ClassroomManager.screenManager.videoContent?.stop()
                ClassroomManager.screenManager.hideContent()
            }
        }
    }

    /**
     * Displays an Image to the students. Called by the teacher.
     *
     * @param _image the content config of the image.
     */
    static DisplayImage(_image: ImageContentConfig): void {
        if (!ClassroomManager.classController?.isTeacher()) return

        ClassroomManager.activeClassroom.displayedImage = _image
        ClassroomManager.activeClassroom.displayedVideo = null
        if (ClassroomManager.activeClassroom) {
            CommunicationManager.EmitImageDisplay({
                id: ClassroomManager.activeClassroom.guid,
                name: ClassroomManager.activeClassroom.className,
                description: ClassroomManager.activeClassroom.classDescription,
                image: _image
            })
        }
    }

    /**
     * Displays a video to the students. Called by the teacher.
     *
     * @param _video the content config of the video.
     */
    static PlayVideo(_video: VideoContentConfig): void {
        if (!ClassroomManager.classController?.isTeacher()) return

        ClassroomManager.activeClassroom.displayedImage = null
        ClassroomManager.activeClassroom.displayedVideo = _video
        if (ClassroomManager.activeClassroom) {
            CommunicationManager.EmitVideoPlay({
                id: ClassroomManager.activeClassroom.guid,
                name: ClassroomManager.activeClassroom.className,
                description: ClassroomManager.activeClassroom.classDescription,
                video: {
                    src: _video.src,
                    caption: _video.caption,
                    playing: true,
                    position: _video.position,
                    volume: _video.volume ?? 1,
                    ratio: _video.ratio
                }
            })
        }
    }

    /**
     * Pauses the currently displayed video for students. Called by the teacher.
     */
    static PauseVideo(): void {
        if (!ClassroomManager.classController?.isTeacher()) return

        ClassroomManager.activeClassroom.displayedVideo.playing = false
        if (ClassroomManager.activeClassroom) {
            CommunicationManager.EmitVideoPause({
                id: ClassroomManager.activeClassroom.guid,
                name: ClassroomManager.activeClassroom.className,
                description: ClassroomManager.activeClassroom.classDescription
            })
        }
    }

    /**
     * Resumes the currently displayed video for students. Called by the teacher.
     */
    static ResumeVideo(): void {
        if (!ClassroomManager.classController?.isTeacher()) return

        ClassroomManager.activeClassroom.displayedVideo.playing = true
        if (ClassroomManager.activeClassroom) {
            CommunicationManager.EmitVideoResume({
                id: ClassroomManager.activeClassroom.guid,
                name: ClassroomManager.activeClassroom.className,
                description: ClassroomManager.activeClassroom.classDescription
            })
        }
    }

    /**
     * Sets the volume for the  students' currently displayed video. Called by the teacher.
     *
     * @param _volume the target volume for the video.
     */
    static SetVideoVolume(_volume: number): void {
        if (!ClassroomManager.classController?.isTeacher()) return

        ClassroomManager.activeClassroom.displayedVideo.volume = _volume
        if (ClassroomManager.activeClassroom) {
            CommunicationManager.EmitVideoVolume({
                id: ClassroomManager.activeClassroom.guid,
                name: ClassroomManager.activeClassroom.className,
                description: ClassroomManager.activeClassroom.classDescription,
                volume: _volume
            })
        }
    }

    /**
     * Displays a model to the students. Called by the teacher.
     *
     * @param _model the content config of the model.
     */
    static PlayModel(_model: ModelContentConfig): void {
        if (!ClassroomManager.classController?.isTeacher()) return

        ClassroomManager.activeClassroom.displayedModel = _model
        if (ClassroomManager.activeClassroom) {
            CommunicationManager.EmitModelPlay({
                id: ClassroomManager.activeClassroom.guid,
                name: ClassroomManager.activeClassroom.className,
                description: ClassroomManager.activeClassroom.classDescription,
                model: _model
            })
        }
    }

    /**
     * Pauses the currently displayed model for students. Called by the teacher.
     * It pauses the model's animation if it has one. Otherwise it stops the model from spinning in its place.
     */
    static PauseModel(): void {
        if (!ClassroomManager.classController?.isTeacher()) return

        if (ClassroomManager.activeClassroom) {
            CommunicationManager.EmitModelPause({
                id: ClassroomManager.activeClassroom.guid,
                name: ClassroomManager.activeClassroom.className,
                description: ClassroomManager.activeClassroom.classDescription
            })
        }
    }

    /**
     * Resumes the currently displayed model for students. Called by the teacher.
     * It resumes the model's animation if it has one. Otherwise it resumes spinning.
     */
    static ResumeModel(): void {
        if (!ClassroomManager.classController?.isTeacher()) return

        if (ClassroomManager.activeClassroom) {
            CommunicationManager.EmitModelResume({
                id: ClassroomManager.activeClassroom.guid,
                name: ClassroomManager.activeClassroom.className,
                description: ClassroomManager.activeClassroom.classDescription
            })
        }
    }

    /**
     * Deactivates all student screens. Called by the teacher.
     */
    static DeactivateScreens(): void {
        if (!ClassroomManager.classController?.isTeacher()) return

        if (ClassroomManager.activeClassroom) {
            CommunicationManager.EmitScreenDeactivation({
                id: ClassroomManager.activeClassroom.guid,
                name: ClassroomManager.activeClassroom.className,
                description: ClassroomManager.activeClassroom.classDescription
            })
        }
    }

    /**
     * Deactivates all student models. Called by the teacher.
     */
    static DeactivateModels(): void {
        if (!ClassroomManager.classController?.isTeacher()) return

        ClassroomManager.activeClassroom.displayedModel = null
        if (ClassroomManager.activeClassroom) {
            CommunicationManager.EmitModelDeactivation({
                id: ClassroomManager.activeClassroom.guid,
                name: ClassroomManager.activeClassroom.className,
                description: ClassroomManager.activeClassroom.classDescription
            })
        }
    }

    /**
     * Registers a content unit. Called by both teachers and students.
     *
     * @param _key the content unit key.
     * @param _unit the content unit instance.
     */
    static RegisterContentUnit(_key: string, _unit: IContentUnit): void {
        ContentUnitManager.register(_key, _unit)
    }

    /**
     * Starts a content unit for students. Called by the teacher.
     *
     * @param _key the content unit key.
     * @param _data any data associated with starting the content unit.
     */
    static StartContentUnit(_key: string, _data: any): void {
        if (!ClassroomManager.classController?.isTeacher()) return

        ContentUnitManager.start(_key, _data)
        if (ClassroomManager.activeClassroom) {
            CommunicationManager.EmitContentUnitStart({
                id: ClassroomManager.activeClassroom.guid,
                name: ClassroomManager.activeClassroom.className,
                description: ClassroomManager.activeClassroom.classDescription,
                unit: {
                    key: _key,
                    data: _data
                }
            })
        }
    }

    /**
     * Ends the currently displayed content unit for students. Called by the teacher.
     */
    static EndContentUnit(): void {
        if (!ClassroomManager.classController?.isTeacher()) return

        ContentUnitManager.end()
        if (ClassroomManager.activeClassroom) {
            CommunicationManager.EmitContentUnitEnd({
                id: ClassroomManager.activeClassroom.guid,
                name: ClassroomManager.activeClassroom.className,
                description: ClassroomManager.activeClassroom.classDescription
            })
        }
    }

    /**
     * Sends data associated with a content unit. Can be called by either teachers or students for two-way communication.
     *
     * @param _data any data associated with the content unit for sending updates.
     */
    static SendContentUnitData(_data: any): void {
        if (!ClassroomManager.activeClassroom) return

        if (ClassroomManager.classController?.isTeacher()) {
            CommunicationManager.EmitContentUnitTeacherSend({
                id: ClassroomManager.activeClassroom.guid,
                name: ClassroomManager.activeClassroom.className,
                description: ClassroomManager.activeClassroom.classDescription,
                data: _data
            })
        }
        else {
            CommunicationManager.EmitContentUnitStudentSend({
                id: ClassroomManager.activeClassroom.guid,
                name: ClassroomManager.activeClassroom.className,
                description: ClassroomManager.activeClassroom.classDescription,
                studentID: UserDataHelper.GetUserId(),
                studentName: UserDataHelper.GetDisplayName(),
                data: _data
            })
        }
    }

    /**
     * Updates all properties in the active content before sending it to the students. Called by the teacher when a student requests to join.
     */
    static UpdateClassroom(): void {
        // image
        if (ClassroomManager.activeContent.images) {
            ClassroomManager.activeContent.images.forEach(image => {
                for (let imageContent of ClassroomManager.screenManager.imageContent.content) {
                    if (imageContent.configuration.src == image.src) {
                        // found
                        image.showing = imageContent.configuration.showing
                        break
                    }
                }
            });
        }
        // video
        if (ClassroomManager.activeContent.videos) {
            ClassroomManager.activeContent.videos.forEach(video => {
                for (let videoContent of ClassroomManager.screenManager.videoContent.content) {
                    if (videoContent.configuration.src == video.src) {
                        // found
                        const config = videoContent.configuration as VideoContentConfig
                        video.playing = config.playing
                        video.volume = config.volume
                        video.position = config.position
                        video.showing = config.showing
                        break
                    }
                }
            });
        }
        // model
        if (ClassroomManager.activeContent.models) {
            ClassroomManager.activeContent.models.forEach(model => {
                for (let modelContent of ClassroomManager.screenManager.modelContent.content) {
                    if (modelContent.configuration.src == model.src) {
                        // found
                        const config = modelContent.configuration as ModelContentConfig
                        model.showing = config.showing
                        model.playing = !modelContent.isPaused
                        break
                    }
                }
            });
        }
    }

    /**
     * Syncs/updates the student's active content and loads the content via the ScreenManager. Called by students upon joining a classroom.
     */
    static SyncClassroom(_activeContentType: MediaContentType): void {
        // sync seating
        if (ClassroomManager.activeClassroom.seatingEnabled) {

        }

        ClassroomManager.screenManager.loadContent()

        // sync image
        ClassroomManager.screenManager.imageContent.content.forEach(content => {
            if (content.configuration.showing) {
                CommunicationManager.OnImageDisplay({
                    id: ClassroomManager.activeClassroom.guid,
                    name: ClassroomManager.activeClassroom.className,
                    description: ClassroomManager.activeClassroom.classDescription,
                    image: content.configuration
                })
            }
        });

        // sync video
        ClassroomManager.screenManager.videoContent.content.forEach(content => {
            if (content.configuration.showing) {
                CommunicationManager.OnVideoPlay({
                    id: ClassroomManager.activeClassroom.guid,
                    name: ClassroomManager.activeClassroom.className,
                    description: ClassroomManager.activeClassroom.classDescription,
                    video: content.configuration
                })
                if (!content.configuration.playing) {
                    CommunicationManager.OnVideoPause({
                        id: ClassroomManager.activeClassroom.guid,
                        name: ClassroomManager.activeClassroom.className,
                        description: ClassroomManager.activeClassroom.classDescription
                    })
                }
            }
        });

        // sync model
        ClassroomManager.screenManager.modelContent.content.forEach(content => {
            if (content.configuration.showing) {
                CommunicationManager.OnModelPlay({
                    id: ClassroomManager.activeClassroom.guid,
                    name: ClassroomManager.activeClassroom.className,
                    description: ClassroomManager.activeClassroom.classDescription,
                    model: content.configuration
                })
                if (!content.configuration.playing) {
                    CommunicationManager.OnModelPause({
                        id: ClassroomManager.activeClassroom.guid,
                        name: ClassroomManager.activeClassroom.className,
                        description: ClassroomManager.activeClassroom.classDescription
                    })
                }
            }
        });

        if (_activeContentType) {
            if (_activeContentType == MediaContentType.image) {
                ClassroomManager.screenManager.currentContent = ClassroomManager.screenManager.imageContent
            }
            else if (_activeContentType == MediaContentType.video) {
                ClassroomManager.screenManager.currentContent = ClassroomManager.screenManager.videoContent
            }
            else if (_activeContentType == MediaContentType.model) {
                ClassroomManager.screenManager.currentContent = ClassroomManager.screenManager.modelContent
            }
        }
    }
}