import yargs from "yargs/yargs"
import { App } from "cdktf"
import { FrontendIngressStack } from "../../construct/frontend/ingress"

const argv = yargs(process.argv.slice(2))
  .options({
    kc: {
      describe: "kubernetes config file",
      type: "string",
      demandOption: true,
      alias: "kubeconfig",
    },
    c: {
      alias: "credentials",
      description: "service account credentials file for gcs backend",
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
    nm: {
      type: "string",
      alias: "name",
      describe: "name of the this install",
      demandOption: true,
    },
    ns: {
      describe: "kubernetes namespace to install",
      type: "string",
      alias: "namespace",
      demandOption: true,
    },
    sr: {
      alias: "service",
      type: "string",
      description: "name of frontend service",
      demandOption: true,
    },
    is: {
      alias: "issuer",
      type: "string",
      demandOption: true,
      describe: "name of the cert-manager issuer",
    },
    hs: {
      alias: "hosts",
      type: "array",
      describe: "list of hosts for ingress to map",
      demandOption: true,
    },
    pa: {
      alias: "path",
      type: "string",
      describe: "path under which the app is available",
      demandOption: true,
    },
  })
  .help()
  .completion()
  .parseSync()

const app = new App()
const deployment = argv.nm.concat("-").concat(argv.ns)
new FrontendIngressStack(app, argv.nm, {
  provider: {
    config: argv.kc,
    remote: argv.r,
    credentials: argv.c,
    bucketName: argv.bn,
    bucketPrefix: deployment,
  },
  resource: {
    name: argv.nm,
    namespace: argv.ns,
    secret: argv.nm.concat("-tls"),
    service: argv.sr,
    issuer: argv.is,
    backendHosts: argv.hs as Array<string>,
    path: argv.pa,
  },
})
app.synth()
