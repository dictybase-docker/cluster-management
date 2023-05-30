import yargs from "yargs/yargs"
import { App, TerraformStack, GcsBackend } from "cdktf"
import { Construct } from "constructs"
import { HelmProvider } from "@cdktf/provider-helm/lib/provider"
import { Release } from "@cdktf/provider-helm/lib/release"
import { readFileSync } from "fs"

type NginxIngressProperties = {
  config: string
  version: string
  remote: boolean
  credentials: string
  bucketName: string
  bucketPrefix: string
  repo: string
  namespace: string
  chart: string
}

class NginxIngress extends TerraformStack {
  constructor(scope: Construct, id: string, options: NginxIngressProperties) {
    const {
      version,
      chart,
      remote,
      namespace,
      credentials,
      bucketName,
      bucketPrefix,
      config,
      repo,
    } = options
    super(scope, id)
    if (remote) {
      new GcsBackend(this, {
        bucket: bucketName,
        prefix: bucketPrefix,
        credentials: readFileSync(credentials).toString(),
      })
    }
    new HelmProvider(this, "helm", {
      kubernetes: {
        configPath: config,
      },
    })
    new Release(this, id, {
      name: chart,
      chart: chart,
      repository: repo,
      createNamespace: true,
      namespace,
      version,
    })
  }
}

const argv = yargs(process.argv.slice(2))
  .options({
    nm: {
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

const app = new App()
new NginxIngress(app, argv.ch, {
  config: argv.kc,
  version: argv.v,
  remote: argv.r,
  credentials: argv.c,
  bucketName: argv.bn,
  bucketPrefix: argv.bp,
  repo: argv.repo,
  namespace: argv.nm,
  chart: argv.ch,
})
app.synth()
