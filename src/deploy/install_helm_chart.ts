import { App, TerraformStack, GcsBackend } from "cdktf"
import { Construct } from "constructs"
import { HelmProvider } from "@cdktf/provider-helm/lib/provider"
import { Release } from "@cdktf/provider-helm/lib/release"
import { readFileSync } from "fs"
import { helmArgv as argv } from "./helm_command_options"

type HelmChartProperties = {
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

class HelmChart extends TerraformStack {
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

const app = new App()
new HelmChart(app, argv.ch, {
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
