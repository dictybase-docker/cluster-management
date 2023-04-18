import { App } from "cdktf"
import { K8Stack } from "./k8s"
import { argv } from "./command_options"

const app = new App()
new K8Stack(app, "k0s-cluster-cdktf", {
  remote: argv.r,
  nodes: argv.n,
  credentials: argv.c,
  bucketName: argv.bn,
  bucketPrefix: argv.bp,
})
app.synth()
