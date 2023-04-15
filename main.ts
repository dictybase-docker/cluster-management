import { App } from "cdktf"
import { K8Stack } from "./k8s"
import yargs from "yargs/yargs"

const argv = yargs(process.argv.slice(2))
  .options({
    r: {
      alias: "remote",
      type: "boolean",
      default: true,
      description: "whether the remote gcs backend will be used",
    },
    n: {
      alias: "nodes",
      description: "number of VM instances for kubernetes nodes",
      type: "number",
      default: 3,
    },
  })
  .parseSync()

const app = new App()
"REMOTE" in process.env
  ? new K8Stack(app, "k0s-cluster-cdktf", true)
  : new K8Stack(app, "k0s-cluster-cdktf")
app.synth()
