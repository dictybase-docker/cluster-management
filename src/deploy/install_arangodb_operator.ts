import { App } from "cdktf"
import { HelmChartStack } from "../construct/helm"
import yargs from "yargs/yargs"

const argv = yargs(process.argv.slice(2))
  .options({
    ns: {
      describe:
        "kubernetes namespace where the arangodb operator will be installed",
      type: "string",
      alias: "namespace",
      default: "operators",
    },
    repo: {
      describe: "arangodb helm chart reposotiry location",
      type: "string",
      alias: "repository",
      default: "https://github.com/arangodb/kube-arangodb/releases/download",
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
      default: "arangodb-operator",
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
      default: "1.2.27",
    },
  })
  .help()
  .completion()
  .parseSync()

const app = new App()
new HelmChartStack(app, "kube-arangodb-crd", {
  config: argv.kc,
  version: argv.v,
  remote: argv.r,
  credentials: argv.c,
  bucketName: argv.bn,
  bucketPrefix: argv.bp,
  repo: argv.repo,
  namespace: argv.ns,
  chart: `kube-arangodb-crd-${argv.v}.tgz`,
  name: "kube-arangodb-crd",
})
new HelmChartStack(app, "kube-arangodb", {
  config: argv.kc,
  version: argv.v,
  remote: argv.r,
  credentials: argv.c,
  bucketName: argv.bn,
  bucketPrefix: argv.bp,
  repo: argv.repo,
  namespace: argv.ns,
  chart: `kube-arangodb-${argv.v}.tgz`,
  name: "kube-arangodb",
  values: [{ name: "DeploymentReplication.Create", value: "false" }],
})
app.synth()
