import yargs from "yargs/yargs"
import { App } from "cdktf"
import { BackendService } from "../construct/dictycr"
import { GraphqlBackendDeploymentStack } from "../construct/graphql_server"

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
      describe:
        "dictycr secret name that contains all authentication credentials",
      type: "string",
      default: "dictycr-secret",
    },
    cm: {
      alias: "config-map",
      describe:
        "dictycr config map which contains the api configuration values",
      type: "string",
      default: "dictycr-configuration",
    },
    im: {
      alias: "image",
      describe: "image to use for the server",
      type: "string",
      default: "dictybase/graphql-server",
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
      value: 8080,
    },
    or: {
      alias: "origins",
      describe: "list of allowed http origins",
      type: "array",
      default: [
        "http://localhost:*",
        "https://dictybase.org",
        "https://*.dictybase.org",
        "https://dictycr.org",
        "https://*.dictycr.org",
        "https://dictybase.dev",
        "https://*.dictybase.dev",
        "https://dictybase.dev*",
      ],
    },
  })
  .help()
  .completion()
  .parseSync()

const app = new App()
const deployment = argv.nm.concat("-api-server")
const service = argv.nm.concat("-api")
new GraphqlBackendDeploymentStack(app, deployment, {
  provider: {
    config: argv.kc,
    remote: argv.r,
    credentials: argv.c,
    bucketName: argv.bn,
    bucketPrefix: deployment.concat("-").concat(argv.ns),
  },
  resource: {
    service,
    secretName: argv.sr.concat("-").concat(argv.ns),
    namespace: argv.ns,
    image: argv.im,
    tag: argv.tg,
    logLevel: argv.ll,
    port: argv.po as number,
    configMapname: argv.cm,
    origins: argv.or as Array<string>,
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
    port: argv.po as number,
    app: deployment,
  },
})
app.synth()
