export interface Logger {
    log: (message: string) => void;
    error: (err: Error) => void;
}
