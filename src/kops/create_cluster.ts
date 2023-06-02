import { exec } from "child_process"
import { getLogger } from "./log"
import { argv } from "./command_line"
import { promisify } from "util"

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
      `--networking cillium-etcd`,
    ]
    const promisedExec = promisify(exec)
    const cmd = kopsCmd.join(" ")
    logger.debug("going to run command %s", cmd)
    const { stdout, stderr } = await promisedExec(cmd, {
      maxBuffer: 1024 * 1024 * 1024 * 1024,
    })
    if (stderr) {
      logger.info("stderr output %s", stderr)
    }
    logger.info("successful run of command %s", stdout)
  } catch (err) {
    logger.error("error in running command %s", err)
  }
}

await runKops()
