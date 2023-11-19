
export interface Logger {
    log: (message: string) => void;
    error: (err: Error) => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {}

export interface LogData {
    log: string[];
    error: Error[];
}

export class LogsData {

    public static console(): Logger {
        return {
            log: console.log, /* eslint-disable-line  no-console */
            error: console.error, /* eslint-disable-line  no-console */
        }
    }

    public static createNull(data?: Partial<LogData>): Logger {

        return data? {
            log: msg => {
                if('log' in data){
                    data.log?.push(msg)
                }
            },
            error: err => {
                if('error' in data){
                    data.error?.push(err)
                }
            },
        }:
            {
                log: noop,
                error: noop,
            }
    }
}
