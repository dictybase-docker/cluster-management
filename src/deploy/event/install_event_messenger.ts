import yargs from "yargs/yargs"
import { App } from "cdktf"
import { EmailBackendDeploymentStack } from "../../construct/event/messenger"

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
    ns: {
      describe: "kubernetes namespace to install",
      type: "string",
      alias: "namespace",
      demandOption: true,
    },
    nm: {
      type: "string",
      alias: "name",
      default: "event-messenger",
      describe: "name of the this install",
    },
    im: {
      alias: "image",
      describe: "image to use for user backend",
      type: "string",
      demandOption: true,
    },
    tg: {
      alias: "tag",
      describe: "tag of the image",
      type: "string",
      demandOption: true,
    },
    ll: {
      alias: "log-level",
      describe: "log level of the app",
      type: "string",
      default: "error",
    },
    sr: {
      alias: "secret",
      describe: "dictycr secret which contains the credentials",
      type: "string",
      demandOption: true,
    },
    cm: {
      alias: "config-map",
      describe: "dictycr config map which contains the configuration values",
      type: "string",
      default: "dictycr-configuration",
    },
    nt: {
      alias: "nats-subject",
      describe: "nats subject name to be used by the email app",
      type: "string",
      default: "OrderService.Create",
    },
  })
  .help()
  .completion()
  .parseSync()

const app = new App()
const emailAppName = argv.nm.concat("-email")
new EmailBackendDeploymentStack(app, emailAppName, {
  provider: {
    config: argv.kc,
    remote: argv.r,
    credentials: argv.c,
    bucketName: argv.bn,
    bucketPrefix: emailAppName.concat("-").concat(argv.nm),
  },
  resource: {
    namespace: argv.ns,
    image: argv.im,
    tag: argv.tg,
    logLevel: argv.ll,
    secretName: argv.sr,
    configMapName: argv.cm,
    natsSubject: argv.nt,
  },
})

app.synth()
