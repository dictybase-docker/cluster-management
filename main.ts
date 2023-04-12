import { App } from "cdktf"
import { K8Stack } from "./k8s"

const app = new App()
"REMOTE" in process.env
  ? new K8Stack(app, "k0s-cluster-cdktf", true)
  : new K8Stack(app, "k0s-cluster-cdktf")
app.synth()
