import yargs from "yargs/yargs"

const helmArgv = yargs(process.argv.slice(2))
  .options({
    nm: {
      describe: "name of the install",
      alias: "name",
      demandOption: true,
      type: "string",
    },
    ns: {
      describe: "kubernetes namespace where the chart will be installed",
      type: "string",
      alias: "namespace",
      demandOption: true,
    },
    ch: {
      describe: "name of the chart",
      type: "string",
      alias: "chart",
      demandOption: true,
    },
    repo: {
      describe: "helm chart reposotiry location",
      type: "string",
      alias: "repository",
      demandOption: true,
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
      default: "kops-cluster-cdktf",
      description:
        "GCS bucket folder prefix where terraform remote state is stored.",
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
      demandOption: true,
    },
  })
  .help()
  .completion()
  .parseSync()

export { helmArgv }
