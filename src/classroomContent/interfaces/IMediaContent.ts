import { MediaContentType } from "../enums";

export interface IMediaContent {
    play(): void;
    stop(): void;
    resume(): void
    pause(): void;
    getContentType(): MediaContentType;
    update(_dt: number): void;
}