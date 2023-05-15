import { App } from "cdktf"
import { K0Stack } from "./k0stack"
import { K0sOutput } from "./k0soutput"
import { argv } from "./command_options"

const app = new App()
const stack = new K0Stack(app, "instance", {
  remote: argv.r,
  nodes: argv.n,
  credentials: argv.c,
  bucketName: argv.bn,
  bucketPrefix: argv.bp,
  sshKeyFile: argv.sk,
  project: argv.pi,
  region: argv.rg,
  zone: argv.z,
  ports: argv.p as Array<string>,
  ipCidrRange: argv.ip,
  masterMachineType: argv.mm,
  masterDiskSize: argv.md,
  nodeMachineType: argv.nt,
  nodeDiskSize: argv.nd,
})
new K0sOutput(app, "cluster", {
  master: stack.master,
  workers: stack.workers,
})

app.synth()
