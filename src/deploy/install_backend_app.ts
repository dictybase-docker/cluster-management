import yargs from "yargs/yargs"
import { App } from "cdktf"
import { BackendService, BackendDeployment } from "../construct/dictycr"

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
      describe: `name of the this install.
		This name will used for setting up the deployment and service names.
		The deployment will become (name)-api-server and the service will be
		(name)-api`,
      demandOption: true,
    },
    ns: {
      describe: "kubernetes namespace to install",
      type: "string",
      alias: "namespace",
      demandOption: true,
    },
    sr: {
      alias: "secret",
      describe: "dictycr secret which contains the backend credentials",
      type: "string",
      demandOption: true,
    },
    im: {
      alias: "image",
      describe: "image to use for backup job",
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
    po: {
      alias: "port",
      describe: "port number for the service",
      type: "number",
      demandOption: true,
    },
  })
  .help()
  .completion()
  .parseSync()

const app = new App()
const deploymentName = argv.nm.concat("api-server")
const service = argv.nm.concat("api")
new BackendDeployment(app, deploymentName, {
  provider: {
    config: argv.kc,
    remote: argv.r,
    credentials: argv.c,
    bucketName: argv.bn,
    bucketPrefix: deploymentName,
  },
  resource: {
    service,
    namespace: argv.ns,
    image: argv.im,
    tag: argv.tg,
    logLevel: argv.ll,
    secretName: argv.sr,
    port: argv.po,
  },
})
new BackendService(app, service, {
  provider: {
    config: argv.kc,
    remote: argv.r,
    credentials: argv.c,
    bucketName: argv.bn,
    bucketPrefix: service,
  },
  resource: {
    namespace: argv.ns,
    port: argv.po,
    app: deploymentName,
  },
})
app.synth()
