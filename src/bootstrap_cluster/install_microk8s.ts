import { Client, SFTPWrapper } from "ssh2"
import { readFileSync, mkdtempSync, writeFileSync } from "fs"
import { parse as urlParse, URL } from "url"
import { tmpdir } from "os"
import { randomBytes } from "crypto"
import { basename, join as joinPath } from "path"
import { parse, stringify } from "yaml"
import { argv } from "./command_line"
import { getLogger } from "./log"
import {
  downloadFile,
  uploadFile,
  connectSftp,
  connectClient,
  commandExec,
} from "./remote_ssh_manager"
import { render, configure } from "Eta"

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

const tempy = () =>
  joinPath(mkdtempSync(tmpdir()), randomBytes(8).toString("hex"))

const parseHost = (input: string) => {
  const terraformObject = JSON.parse(readFileSync(input).toString())
  return terraformObject["microk8s-instance"].master
}

const logger = getLogger(argv.l)
const host = parseHost(argv.i)
configure({ autoTrim: false, cache: true })

const install_setup_microk8s = async () => {
  try {
    const client = (await connectClient({
      host,
      logger,
      username: argv.u,
      privateKey: readFileSync(argv.sk).toString(),
    })) as Client
    const sftpClient = (await connectSftp({ client, logger })) as SFTPWrapper
    const file = basename(argv.ss)
    if (argv.rmk) {
      await uploadFile({
        client: sftpClient,
        src: argv.rms,
        dest: basename(argv.rms),
        logger,
      })
      await commandExec({ client, logger, remoteFile: basename(argv.rms) })
    }
    await uploadFile({ client: sftpClient, src: argv.ss, dest: file, logger })
    await commandExec({ client, logger, remoteFile: file })
    const tmpFile = tempy()
    await downloadFile({
      client: sftpClient,
      logger,
      src: argv.kc,
      dest: tmpFile,
    })
    updateKubeConfig({ tmpFile, host })
    const tmpTemplate = tempy()
    writeFileSync(
      tmpTemplate,
      render(readFileSync(argv.ct).toString(), {
        host: host,
      }),
    )
    await uploadFile({
      client: sftpClient,
      logger,
      src: tmpTemplate,
      dest: "/var/snap/microk8s/current/certs/csr.conf.template",
    })
    await uploadFile({
      client: sftpClient,
      src: argv.ss,
      dest: basename(argv.rs),
      logger,
    })
    await commandExec({ client, logger, remoteFile: basename(argv.rs) })
    client.end()
  } catch (err: any) {
    throw err
  }
}

await install_setup_microk8s()
