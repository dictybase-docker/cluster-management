import { App } from "cdktf"
import { HelmChartStack } from "../construct/helm"
import yargs from "yargs/yargs"

const argv = yargs(process.argv.slice(2))
  .options({
    nm: {
      describe: "name of the minio install",
      alias: "name",
      type: "string",
      default: "minio",
    },
    ns: {
      describe: "kubernetes namespace where the pgo operator will be installed",
      type: "string",
      alias: "namespace",
      demandOption: true,
    },
    ch: {
      describe: "name of the chart",
      type: "string",
      alias: "chart",
      default: "minio",
    },
    repo: {
      describe: "nats helm chart reposotiry location",
      type: "string",
      alias: "repository",
      default: "https://charts.min.io",
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
    ver: {
      alias: "chart-version",
      type: "string",
      describe: "version of the chart to be deployed",
      default: "5.0.13",
    },
    ds: {
      alias: "disk-size",
      type: "string",
      describe: "initial disk size assigned for storage",
      default: "75Gi",
    },
    ms: {
      alias: "minio-secret",
      type: "string",
      describe: "secret that contain root credentials for minio",
      demandOption: true,
    },
  })
  .help()
  .completion()
  .parseSync()

const app = new App()
const deployName = argv.nm.concat("-").concat(argv.ns)
new HelmChartStack(app, deployName, {
  config: argv.kc,
  version: argv.ver,
  remote: argv.r,
  credentials: argv.c,
  bucketName: argv.bn,
  bucketPrefix: deployName,
  repo: argv.repo,
  namespace: argv.ns,
  chart: argv.ch,
  name: argv.nm,
  values: [
    { name: "mode", value: "standalone" },
    { name: "persistence.size", value: argv.ds },
    { name: "persistence.storageClass", value: "dictycr-balanced" },
    { name: "existingSecret", value: argv.ms },
    { name: "resources.requests.memory", value: "256Mi" },
  ],
})
app.synth()
