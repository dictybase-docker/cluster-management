import { App } from "cdktf"
import { K8Stack } from "./k8s"

const app = new App()
new K8Stack(app, "k0s-cluster-cdktf")
app.synth()
