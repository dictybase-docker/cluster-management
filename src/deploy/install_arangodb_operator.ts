import { App } from "cdktf"
import yargs from "yargs/yargs"
import { TerraformStack, GcsBackend } from "cdktf"
import { Construct } from "constructs"
import { HelmProvider } from "@cdktf/provider-helm/lib/provider"
import { Release, ReleaseSet } from "@cdktf/provider-helm/lib/release"
import { readFileSync } from "fs"

type HelmChartProperties = {
  values?: Array<ReleaseSet>
  config: string
  version: string
  remote: boolean
  credentials: string
  bucketName: string
  bucketPrefix: string
  namespace: string
  chart: string
  name: string
}

class HelmChartStack extends TerraformStack {
  constructor(scope: Construct, id: string, options: HelmChartProperties) {
    const {
      version,
      chart,
      remote,
      namespace,
      credentials,
      bucketName,
      bucketPrefix,
      config,
      name,
      values,
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
      name: name,
      chart: chart,
      createNamespace: true,
      set: values,
      namespace,
      version,
    })
  }
}

yargs(process.argv.slice(2))
  .command(
    "install-operator",
    "install arangodb operator",
    {
      ns: {
        describe:
          "kubernetes namespace where the arangodb operator will be installed",
        type: "string",
        alias: "namespace",
        default: "operators",
      },
      repo: {
        describe: "arangodb helm operator chart reposotiry location",
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
    },
    (argv) => {
      const app = new App()
      new HelmChartStack(app, "kube-arangodb", {
        config: argv.kc,
        version: argv.v,
        remote: argv.r,
        credentials: argv.c,
        bucketName: argv.bn,
        bucketPrefix: argv.bp,
        namespace: argv.ns,
        chart: `${argv.repo}/${argv.v}/kube-arangodb-${argv.v}.tgz`,
        name: "kube-arangodb",
        values: [
          { name: "operator.features.deploymentReplications", value: "false" },
        ],
      })
      app.synth()
    },
  )
  .command(
    "install-crd",
    "install arangodb crd",
    {
      ns: {
        describe:
          "kubernetes namespace where the arangodb crd will be installed",
        type: "string",
        alias: "namespace",
        default: "operators",
      },
      repo: {
        describe: "arangodb helm operator chart reposotiry location",
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
        default: "arangodb-crd",
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
    },
    (argv) => {
      const app = new App()
      new HelmChartStack(app, "kube-arangodb-crd", {
        config: argv.kc,
        version: argv.v,
        remote: argv.r,
        credentials: argv.c,
        bucketName: argv.bn,
        bucketPrefix: argv.bp,
        namespace: argv.ns,
        chart: `${argv.repo}/${argv.v}/kube-arangodb-crd-${argv.v}.tgz`,
        name: "kube-arangodb-crd",
      })
      app.synth()
    },
  )
  .help()
  .completion()
  .parseSync()
