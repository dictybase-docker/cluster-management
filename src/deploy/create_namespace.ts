import yargs from "yargs/yargs"
import {
  NamespaceStack,
  NamespaceStackProperties,
} from "../construct/namespace"
import { RemoteStack } from "../construct/remote"
import { App } from "cdktf"

const argv = yargs(process.argv.slice(2))
  .options({
    ns: {
      describe: "kubernetes namespace to create",
      type: "string",
      alias: "namespace",
      demandOption: true,
    },
    kc: {
      describe: "kubernetes config file",
      type: "string",
      demandOption: true,
      alias: "kubeconfig",
    },
    c: {
      alias: "credentials",
      description: "service account credentials file for google provider",
      type: "string",
      default: "credentials/cloud-manager.json",
    },
    bn: {
      alias: "bucket-name",
      type: "string",
      default: "dicty-terraform-state",
      description: "GCS bucket name where terraform remote state is stored.",
    },
    r: {
      alias: "remote",
      type: "boolean",
      default: true,
      description: "whether the remote gcs backend will be used",
    },
  })
  .help()
  .completion()
  .parseSync()

const app = new App()
let props: NamespaceStackProperties = {
  config: argv.kc,
  namespace: argv.ns,
}
if (argv.r) {
  const remote = new RemoteStack(app, argv.ns.concat("-remote"), {
    credentials: argv.c,
    bucketName: argv.bn,
    bucketPrefix: argv.ns,
  })
  props = { ...props, remote }
}
new NamespaceStack(app, argv.ns, props)
app.synth()
