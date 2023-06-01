import { App } from "cdktf"
import { HelmChartStack } from "../construct/helm"
import yargs from "yargs/yargs"

const argv = yargs(process.argv.slice(2))
  .options({
    nm: {
      describe: "name of the pgo install",
      alias: "name",
      type: "string",
      default: "postgresql-operator",
    },
    ns: {
      describe: "kubernetes namespace where the pgo operator will be installed",
      type: "string",
      alias: "namespace",
      default: "operators",
    },
    ch: {
      describe: "name of the chart",
      type: "string",
      alias: "chart",
      default: "pgo",
    },
    repo: {
      describe: "pgo helm chart reposotiry location",
      type: "string",
      alias: "repository",
      default: "oci://registry.developers.crunchydata.com/crunchydata",
    },
    kc: {
      describe: "kubernetes config file",
      type: "string",
      demandOption: true,
      alias: "kubeconfig",
      default: process.env.KUBECONFIG,
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
    bp: {
      alias: "bucket-prefix",
      type: "string",
      description:
        "GCS bucket folder prefix where terraform remote state is stored.",
      default: "postgresql-operator",
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
      default: "5.3.1",
    },
  })
  .help()
  .completion()
  .parseSync()

const app = new App()
new HelmChartStack(app, argv.nm, {
  config: argv.kc,
  version: argv.v,
  remote: argv.r,
  credentials: argv.c,
  bucketName: argv.bn,
  bucketPrefix: argv.bp,
  repo: argv.repo,
  namespace: argv.ns,
  chart: argv.ch,
  name: argv.nm,
  values: [{ name: "disable_check_for_upgrades", value: "true" }],
})
app.synth()
