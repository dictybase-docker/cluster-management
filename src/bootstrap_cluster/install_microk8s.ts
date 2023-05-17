import { Client } from "ssh2"
import {
  readFileSync,
  createReadStream,
  createWriteStream,
  mkdtempSync,
} from "fs"
import { tmpdir } from "os"
import { randomBytes } from "crypto"
import { basename, join } from "path"
import { argv } from "./command_line"
import { getLogger } from "./log"

const logger = getLogger(argv.l)

const kubeconfigTempFile = () =>
  join(mkdtempSync(tmpdir()), randomBytes(8).toString("hex"))

const conn = new Client()
conn
  .on("ready", () => {
    logger.info("client is ready")
    const file = basename(argv.ss)
    conn.sftp((err, sftp) => {
      if (err) {
        logger.error("error in sftp connection %s", err)
        throw err
      }
      logger.info("running sftp")
      const rs = createReadStream(argv.ss)
      const ws = sftp.createWriteStream(file)
      rs.pipe(ws)
      ws.on("close", () => {
        logger.info("uploaded file %s", argv.ss)
        conn.exec(`/usr/bin/sh ${file}`, (err, stream) => {
          if (err) {
            logger.error("error executing the file", err.message)
            throw err
          }
          // @ts-ignore
          stream.on("close", (code, signal) => {
            logger.debug(
              "closed stream with code %s and signal %s",
              code,
              signal,
            )
            const krs = sftp.createReadStream(argv.kc)
            const tmpFile = kubeconfigTempFile()
            const kws = createWriteStream(tmpFile)
            krs.pipe(kws)
            kws.on("close", () => {
              logger.info("downloaded kubernetes file")
              conn.end()
              logger.debug(tmpFile)
            })
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
    })
  })
  .connect({
    host: argv.ho,
    username: argv.u,
    privateKey: readFileSync(argv.sk).toString(),
  })
