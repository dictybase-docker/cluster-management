import { createLogger, transports, format } from "winston"

const getLogger = (level: string) =>
  createLogger({
    level: level,
    transports: [new transports.Console()],
    format: format.combine(
      format.combine(
        format.timestamp({
          format: "YYYY-MM-DD HH:mm:ss",
        }),
      ),
      format.errors({ stack: true }),
      format.splat(),
      format.json(),
    ),
  })

export { getLogger }
