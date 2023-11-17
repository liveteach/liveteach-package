export interface IContentUnit {
    start(_data: any): void;
    end(): void;
    update(_data: any): void;
}