import yargs from "yargs/yargs"
import { App } from "cdktf"
import { PgschemLoadingStack } from "../../construct/schema_job"

const argv = yargs(process.argv.slice(2))
  .options({
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
    ps: {
      alias: "pg-secret",
      describe: "postgres secret which contains the database credentials",
      type: "string",
      demandOption: true,
    },
    db: {
      alias: "database",
      describe: "postgres database where the schema will be installed",
      type: "string",
      demandOption: true,
    },
    im: {
      alias: "image",
      describe: "image to use for installing the schema",
      type: "string",
      demandOption: true,
    },
    tg: {
      alias: "tag",
      describe: "tag of the image for installing the schema",
      type: "string",
      demandOption: true,
    },
  })
  .help()
  .completion()
  .parseSync()

const app = new App()
const deployName = argv.nm.concat("-").concat(argv.ns)
new PgschemLoadingStack(app, deployName, {
  provider: {
    config: argv.kc,
    remote: argv.r,
    credentials: argv.c,
    bucketName: argv.bn,
    bucketPrefix: deployName,
  },
  resource: {
    secretName: argv.ps,
    namespace: argv.ns,
    image: argv.im,
    tag: argv.tg,
    database: argv.db,
  },
})
app.synth()
