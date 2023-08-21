import yargs from "yargs/yargs"
import { App } from "cdktf"
import { BackendService } from "../../construct/dictycr"
import { UserBackendDeployment } from "../../construct/legacy/user"

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
    ps: {
      alias: "pg-secret",
      describe: "postgres secret which contains the database credentials",
      type: "string",
      default: "postgres-pguser-dictycr",
    },
    db: {
      alias: "database",
      describe: "postgres database where the schema will be installed",
      type: "string",
      value: "authl",
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
    po: {
      alias: "port",
      describe: "port number for the service",
      type: "string",
      value: "9596",
    },
    ah: {
      alias: "api-host",
      describe: "http endpoint for user service",
      type: "string",
      default: "http://localhost",
    },
  })
  .help()
  .completion()
  .parseSync()

const app = new App()
const backends = ["user", "role", "permission"]
backends.forEach((bc) => {
  /* name of the this install.
This name will used for setting up the deployment and service names.
The deployment will become (name)-api-server and the service will be
(name)-api`, */
  const deployment = bc.concat("-api-server")
  const service = bc.concat("-api")
  new UserBackendDeployment(app, deployment, {
    provider: {
      config: argv.kc,
      remote: argv.r,
      credentials: argv.c,
      bucketName: argv.bn,
      bucketPrefix: deployment.concat("-").concat(argv.ns),
    },
    resource: {
      service,
      namespace: argv.ns,
      image: argv.im,
      tag: argv.tg,
      logLevel: argv.ll,
      secretName: argv.ps,
      database: argv.db as string,
      apiHost: argv.ah,
      port: argv.po as string,
      command: `start-${argv.nm}-server`,
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
      port: Number(argv.po),
      app: deployment,
    },
  })
})

app.synth()
