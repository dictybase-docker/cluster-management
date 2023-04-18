import { App } from "cdktf"
import { K8Stack } from "./k8s"
import yargs from "yargs/yargs"

const argv = yargs(process.argv.slice(2))
  .options({
    bn: {
      alias: "bucket-name",
      type: "string",
      default: "dicty-terraform-state",
      description: "GCS bucket name where terraform remote state is stored.",
    },
    bf: {
      alias: "bucket-prefix",
      type: "string",
      default: "k0s-cluster-cdktf",
      description:
        "GCS bucket folder prefix where terraform remote state is stored.",
    },
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
      default: 2,
    },
    c: {
      alias: "credentials",
      description: "service account credentials file for google provider",
      type: "string",
      default: "credentials.json",
    },
  })
  .parseSync()

const app = new App()
new K8Stack(app, "k0s-cluster-cdktf", {
  remote: argv.r,
  nodes: argv.n,
  credentials: argv.c,
})
app.synth()
