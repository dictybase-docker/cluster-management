import yargs from "yargs/yargs"
import { writeFileSync, readFileSync } from "fs"
import { createClusterYml } from "./k0s_cluster"

type TerraformOutputProperties = {
  instance: any
  cluster: {
    master: string
    workers: Array<string>
  }
}

const argv = yargs(process.argv.slice(2))
  .options({
    sk: {
      alias: "ssh-key",
      description:
        "public ssh key file that will be injected in the vm for login",
      type: "string",
      default: "k8sVM",
    },
    kv: {
      alias: "k8-version",
      type: "string",
      demandOption: true,
      description: "kubernetes cluster version",
    },
    u: {
      alias: "user",
      type: "string",
      default: "newman",
      description: "ssh login user",
    },
    o: {
      alias: "output",
      type: "string",
      default: "cluster_config.yml",
      description: "output yml file for writing the cluster configuration",
    },
    i: {
      alias: "input",
      type: "string",
      default: "ip.json",
      description:
        "json output file generated from terraform run containing the public ips of vm instance",
    },
    t: {
      alias: "token",
      type: "string",
      default: "github_token.tx",
      description: "github personal access token to use the API",
    },
  })
  .parseSync()

const terraformObject: TerraformOutputProperties = JSON.parse(
  readFileSync(argv.i).toString(),
)
const hosts = [
  Object.create({
    role: "controller",
    user: argv.u,
    keyPath: argv.sk,
    address: terraformObject.cluster.master,
  }),
  ...terraformObject.cluster.workers.map((ip) =>
    Object.create({
      role: "worker",
      user: argv.u,
      keyPath: argv.sk,
      address: ip,
    }),
  ),
]
writeFileSync(
  argv.o,
  await createClusterYml({
    version: argv.kv,
    hosts,
    cloudProvider: {
      githubToken: readFileSync(argv.t).toString(),
    },
  }),
)
