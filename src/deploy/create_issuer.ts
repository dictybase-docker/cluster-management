import yargs from "yargs/yargs"
import { IssuerStack } from "../construct/cert_manager"
import { App } from "cdktf"

const argv = yargs(process.argv.slice(2))
  .options({
    sv: {
      alias: "server",
      type: "string",
      describe: "acme server endpoint",
      default: "https://acme-staging-v02.api.letsencrypt.org/directory",
    },
    nm: {
      type: "string",
      alias: "name",
      describe: "name of the this install",
      default: "cert-issuer",
    },
    em: {
      type: "string",
      alias: "email",
      describe: "email to be associated with issuer",
      demandOption: true,
    },
    ns: {
      describe: "kubernetes namespace to install",
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
  })
  .help()
  .completion()
  .parseSync()

const app = new App()
const deployName = argv.nm.concat("-").concat(argv.ns)
const props = {
  provider: {
    config: argv.kc,
    remote: argv.r,
    credentials: argv.c,
    bucketName: argv.bn,
    bucketPrefix: deployName,
  },
  resource: {
    server: argv.sv,
    namespace: argv.ns,
    name: argv.nm,
    email: argv.em,
    secretRef: deployName.concat("-secretref"),
  },
}
new IssuerStack(app, deployName, props)
app.synth()
