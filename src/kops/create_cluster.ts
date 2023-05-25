import { Logger as LogHandler } from "winston"
import { exec } from "child_process"
import { getLogger } from "./log"
import { argv } from "./command_line"

type runCommandProperties = {
  logger: LogHandler
  cmd: string
}

const runCommand = ({ cmd, logger }: runCommandProperties) => {
  return new Promise((resolve, reject) => {
    logger.debug("going to run command %s", cmd)
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        logger.error("error in running %s", err.message)
        return reject(err)
      }
      if (stderr) {
        logger.error("unexpected error %s", stderr)
        return reject(stderr)
      }
      resolve(stdout)
    })
  })
}

const runKops = async () => {
  const logger = getLogger(argv.l)
  try {
    let kopsCmd: Array<string | number | undefined> = Array.of(
      "kops create cluster ",
    )
    kopsCmd = [
      ...kopsCmd,
      `--cloud=${argv.cp} `,
      `--name=${argv.cn} `,
      `--state=${argv.st} `,
      `--project=${argv.pi} `,
      `--zones=${argv.z} `,
      `--ssh-public-key=${argv.sk} `,
      `--master-size=${argv.ms} `,
      `--master-count=${argv.mc} `,
      `--master-volume-size=${argv.mvs} `,
      `--image=${argv.im} `,
      `--kubernetes-version=${argv.kv} `,
      `--node-size=${argv.ns} `,
      `--node-volume-size=${argv.nvs} `,
      `--node-count=${argv.nc}`,
    ]
    await runCommand({ cmd: kopsCmd.join(""), logger })
  } catch (error) {
    throw error
  }
}

await runKops()
