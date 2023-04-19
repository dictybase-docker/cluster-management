import { App } from "cdktf"
import { K8Stack } from "./k8stack"
import { K0Stack } from "./k0stack"
import { argv } from "./command_options"

const app = new App()
const stack = new K8Stack(app, "k0s-vm-cdktf", {
  remote: argv.r,
  nodes: argv.n,
  credentials: argv.c,
  bucketName: argv.bn,
  bucketPrefix: argv.bp,
})
new K0Stack(app, "k0s-cluster-cdktf", {
  master: stack.master,
  workers: stack.workers,
})

app.synth()
