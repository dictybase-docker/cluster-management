import { Client } from "ssh2"
import {
  readFileSync,
  createReadStream,
  createWriteStream,
  mkdtempSync,
  writeFileSync,
} from "fs"
import { parse as urlParse, URL } from "url"
import { tmpdir } from "os"
import { randomBytes } from "crypto"
import { basename, join } from "path"
import { parse, stringify } from "yaml"
import { argv } from "./command_line"
import { getLogger } from "./log"

type updateKubeConfigProperties = {
  tmpFile: string
  host: string
}

const updateKubeConfig = ({ tmpFile, host }: updateKubeConfigProperties) => {
  const docs = parse(readFileSync(tmpFile).toString())
  const existSeverURL = urlParse(docs.clusters.at(0).cluster.server)
  const newServerURL = new URL(
    `${existSeverURL.protocol}//${host}:${existSeverURL.port}`,
  )
  docs.clusters.at(0).cluster.server = newServerURL.toString()
  writeFileSync(argv.kc, stringify(docs))
}

const kubeconfigTempFile = () =>
  join(mkdtempSync(tmpdir()), randomBytes(8).toString("hex"))

const parseHost = (input: string) => {
  const terraformObject = JSON.parse(readFileSync(input).toString())
  return terraformObject["microk8s-instance"].master
}

const logger = getLogger(argv.l)
const host = parseHost(argv.i)
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
              updateKubeConfig({ tmpFile, host })
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
    host: host,
    username: argv.u,
    privateKey: readFileSync(argv.sk).toString(),
  })
