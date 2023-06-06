import { App } from "cdktf"
import { helmArgv as argv } from "./helm_command_options"
import { HelmChartStack } from "../construct/helm"

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
})
app.synth()
