import yargs from "yargs/yargs"
import { App } from "cdktf"
import {
  BackendService,
  FrontendDeploymentStack,
} from "../../construct/dictycr"

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
    im: {
      alias: "image",
      describe: "image to use for the server",
      type: "string",
      demandOption: true,
    },
    tg: {
      alias: "tag",
      describe: "tag of the image",
      type: "string",
      demandOption: true,
    },
    po: {
      alias: "port",
      describe: "port number for the service",
      type: "number",
      default: 8000,
    },
  })
  .help()
  .completion()
  .parseSync()

const app = new App()
const appName = argv.nm.concat("-api-server")
const service = argv.nm.concat("-api")
new FrontendDeploymentStack(app, appName, {
  provider: {
    config: argv.kc,
    remote: argv.r,
    credentials: argv.c,
    bucketName: argv.bn,
    bucketPrefix: appName.concat("-").concat(argv.ns),
  },
  resource: {
    service,
    namespace: argv.ns,
    image: argv.im,
    tag: argv.tg,
    port: argv.po,
  },
})
new BackendService(app, service, {
  provider: {
    config: argv.kc,
    remote: argv.r,
    credentials: argv.c,
    bucketName: argv.bn,
    bucketPrefix: service.concat("-").concat(argv.ns),
  },
  resource: {
    namespace: argv.ns,
    port: argv.po,
    app: appName,
  },
})
app.synth()
