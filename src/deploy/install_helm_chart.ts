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
  name: string
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
      name,
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
      repository: repo,
      createNamespace: true,
      namespace,
      version,
    })
  }
}

const app = new App()
new HelmChart(app, argv.nm, {
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
})
app.synth()
