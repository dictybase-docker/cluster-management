import { Client, SFTPWrapper } from "ssh2"
import { createReadStream, createWriteStream } from "fs"
import { Logger as LogHandler } from "winston"

type commandExecProperties = {
  logger: LogHandler
  client: Client
  remoteFile: string
}

type errorProperties = Error | undefined | null

type sshConnectProperties = {
  username: string
  host: string
  privateKey: string
  logger: LogHandler
}

type sftpConnectProperties = {
  client: Client
  logger: LogHandler
}

type sftpUploadProperties = {
  client: SFTPWrapper
  src: string
  dest: string
  logger: LogHandler
}

type sftpDownloadProperties = sftpUploadProperties

const connectClient = ({
  username,
  host,
  privateKey,
  logger,
}: sshConnectProperties) => {
  return new Promise((resolve, reject) => {
    logger.debug("Connecting SSH client")
    const client = new Client()
    client
      .on("ready", () => {
        logger.debug("Client connected.")
        return resolve(client)
      })
      .on("error", (err) => {
        client.end()
        return reject(err)
      })
      .connect({ username, host, privateKey })
  })
}

const connectSftp = ({ client, logger }: sftpConnectProperties) => {
  return new Promise((resolve, reject) => {
    logger.debug("Starting SFTP stream...")
    client.sftp((err, stream) => {
      if (err) {
        logger.error("SFTP connection failed.")
        return reject(err)
      }
      logger.debug("SFTP stream started.")
      return resolve(stream)
    })
  })
}

const uploadFile = ({ client, src, dest, logger }: sftpUploadProperties) => {
  return new Promise((resolve, reject) => {
    logger.debug("uploading file from %s to %s", src, dest)
    const rs = createReadStream(src)
    const ws = client.createWriteStream(dest)
    rs.pipe(ws)
    ws.on("close", () => {
      logger.debug("uploading complete...")
      return resolve(client)
    })
    ws.on("error", (err: errorProperties) => {
      return reject(err)
    })
  })
}

const downloadFile = ({
  client,
  src,
  dest,
  logger,
}: sftpDownloadProperties) => {
  return new Promise((resolve, reject) => {
    logger.debug("downloading file from %s to %s", src, dest)
    const rs = client.createReadStream(src)
    const ws = createWriteStream(dest)
    rs.pipe(ws)
    ws.on("close", () => {
      logger.debug("downloading complete...")
      return resolve(client)
    })
    ws.on("error", (err: errorProperties) => {
      return reject(err)
    })
  })
}

const commandExec = ({ client, logger, remoteFile }: commandExecProperties) => {
  return new Promise((resolve, reject) => {
    client.exec(`/usr/bin/sh ${remoteFile}`, (err, stream) => {
      if (err) {
        return reject(err)
      }
      stream.stderr.on("data", (data) => {
        logger.debug("STDERR %s", data)
      })
      // @ts-ignore
      stream.on("data", (data) => {
        logger.debug("STDOUT %s", data)
      })
      // @ts-ignore
      stream.on("close", (code, signal) => {
        logger.debug("closed stream with code %s and signal %s", code, signal)
        return resolve(stream)
      })
    })
  })
}

export { downloadFile, uploadFile, connectSftp, connectClient, commandExec }
