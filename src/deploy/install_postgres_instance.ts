import yargs from "yargs/yargs"
import { PostgresStack } from "../construct/postgres"
import { App } from "cdktf"

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
    nm: {
      describe: "name of the install",
      alias: "name",
      type: "string",
      default: "postgres",
    },
    ns: {
      describe: "kubernetes namespace where the chart will be installed",
      type: "string",
      alias: "namespace",
      demandOption: true,
    },
    pv: {
      alias: "postgres-version",
      type: "string",
      describe:
        "postgres version to install, comes from crunchydata version numbering",
      default: "14.5-0",
    },
    sc: {
      alias: "storage-class",
      type: "string",
      describe: "name of storage class to use for persistence",
      default: "dictycr-balanced",
    },
    ss: {
      alias: "storage-size",
      type: "number",
      describle: "size of the storage in GB",
      default: 30,
    },
  })
  .help()
  .completion()
  .parseSync()

const app = new App()
const deployName = argv.nm.concat("-").concat(argv.ns)
new PostgresStack(app, deployName, {
  provider: {
    config: argv.kc,
    remote: argv.r,
    credentials: argv.c,
    bucketName: argv.bn,
    bucketPrefix: deployName,
  },
  resource: {
    namespace: argv.ns,
    name: argv.nm,
    storageClass: argv.sc,
    storageSize: argv.ss,
    version: argv.pv,
  },
})
app.synth()