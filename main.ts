import { App } from "cdktf"
import VmInstanceStack from "./instance"

const app = new App()
new VmInstanceStack(app, "k0s-cluster-cdktf")
app.synth()
