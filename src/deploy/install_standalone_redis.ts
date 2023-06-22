import yargs from "yargs/yargs"
import { RedisStandAloneStack } from "../construct/redis"
import { App } from "cdktf"

const argv = yargs(process.argv.slice(2))
  .options({
    nm: {
      describe: "name of the install",
      alias: "name",
      type: "string",
      default: "redis",
    },
    ns: {
      describe: "kubernetes namespace where the chart will be installed",
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
    rv: {
      alias: "redis-version",
      type: "string",
      describe: "redis version to install",
      default: "7.0.5",
    },
    rxv: {
      alias: "redis-exporter-version",
      type: "string",
      describe: "redis metric exporter version to install",
      default: "1.44.0",
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
new RedisStandAloneStack(app, deployName, {
  config: argv.kc,
  redisVersion: argv.rv,
  redisExporterVersion: argv.rxv,
  remote: argv.r,
  credentials: argv.c,
  bucketName: argv.bn,
  bucketPrefix: deployName,
  namespace: argv.ns,
  name: argv.nm,
  storageClass: argv.sc,
  storageSize: argv.ss,
})
app.synth()
