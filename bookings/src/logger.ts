export interface Logs {
    info: (message: string) => void;
    error: (err: Error) => void;
}

function noop() { /**/ }

export interface LogData {
    log: string[];
    error: Error[];
}

interface LoggerImpl{
    log: (message: string) => void;
    error: (err: Error) => void;
}

export class LogsData implements Logs{

    private constructor(private readonly logger: LoggerImpl) {
    }

    public error(err: Error): void {
        this.logger.error(err)
    }

    public info(message: string): void {
        this.logger.log(message)
    }

    public static console(): LogsData {
        return new LogsData(console)
    }

    public static createNull(): LogsData {
        const noopLogger: LoggerImpl = {
            log: noop,
            error: noop,
        }
        return new LogsData(noopLogger)
    }
}
