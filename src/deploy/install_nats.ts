import { App } from "cdktf"
import { HelmChartStack } from "../construct/helm"
import yargs from "yargs/yargs"

const argv = yargs(process.argv.slice(2))
  .options({
    nm: {
      describe: "name of the nats install",
      alias: "name",
      type: "string",
      default: "nats",
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
      default: "nats",
    },
    repo: {
      describe: "nats helm chart reposotiry location",
      type: "string",
      alias: "repository",
      default: "https://nats-io.github.io/k8s/helm/charts",
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
    v: {
      alias: "chart-version",
      type: "string",
      describe: "version of the chart to be deployed",
      default: "0.19.14",
    },
    nv: {
      alias: "nats-version",
      type: "string",
      describe: "nats version",
      default: "2.9.17-alpine",
    },
  })
  .help()
  .completion()
  .parseSync()

const app = new App()
const deployName = argv.nm.concat("-").concat(argv.ns)
new HelmChartStack(app, deployName, {
  config: argv.kc,
  version: argv.v,
  remote: argv.r,
  credentials: argv.c,
  bucketName: argv.bn,
  bucketPrefix: deployName,
  repo: argv.repo,
  namespace: argv.ns,
  chart: argv.ch,
  name: argv.nm,
  values: [
    { name: "container.image.tag", value: argv.nv },
    { name: "service.enabled", value: "false" },
  ],
})
app.synth()
