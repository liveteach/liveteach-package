export interface IContentUnit {
    start(_data: any): void;
    end(): void;
    send(): void;
    receive(): void;
}