import yargs from "yargs/yargs"
import { Client } from "ssh2"
import { readFileSync } from "fs"
import { createLogger, transports, format } from "winston"

const argv = yargs(process.argv.slice(2))
  .options({
    ho: {
      alias: "host",
      type: "string",
      description: "remote ssh server",
      demandOption: true,
    },
    u: {
      alias: "user",
      type: "string",
      description: "user name for remote server",
      default: "newman",
    },
    sk: {
      alias: "ssh-key",
      description: "private ssh key file that will be used for login",
      type: "string",
      default: "k8sVM.pub",
    },
    ss: {
      alias: "script",
      type: "string",
      default: "bootstrap_microk8s.sh",
      description: "script to execute on remote server",
    },
    l: {
      alias: "log-level",
      type: "string",
      default: "error",
      description: "logging level, should be one of debug,info,warn,error",
    },
  })
  .parseSync()

const logger = createLogger({
  level: argv.l,
  transports: [new transports.Console()],
  format: format.combine(
    format.combine(
      format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
      }),
      format.errors({ stack: true }),
      format.splat(),
    ),
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
  ),
})

const conn = new Client()
conn.connect({
  host: argv.ho,
  username: argv.u,
  privateKey: readFileSync(argv.ss).toString(),
})
conn.on("ready", () => {
  conn.sftp((err, sftp) => {
    if (err) {
      logger.error("error in sftp connection %s", err)
      throw err
    }
    sftp.fastPut(argv.ss, "/tmp/", (err) => {
      if (err) {
        logger.error(
          "error %s in sftping the file %s to /tmp",
          err,
          `/tmp/${argv.ss}`,
        )
        throw err
      }
    })
  })
  conn.exec(`/bin/sh /tmp/${argv.ss}`, (err, stream) => {
    if (err) {
      logger.error("error executing the file %s", err)
      throw err
    }
    // @ts-ignore
    stream.on("close", (code, signal) => {
      logger.info("closed stream with code %s and signal %s", code, signal)
      conn.end()
    })
    stream.stderr.on("data", (data) => {
      logger.info("STDERR %s", data)
    })
    // @ts-ignore
    stream.on("data", (data) => {
      logger.info("STDOUT %s", data)
    })
  })
})
