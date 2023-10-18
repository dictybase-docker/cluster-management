import { App } from "cdktf"
import {
  process_logto_ingress_cmdline,
  logtoIngressOptions,
  ingress_deployment,
} from "./logto_cli"
import { LogtoIngressStack } from "../../construct/middleware/logto"
import { getService } from "../../k8s"

const argv = process_logto_ingress_cmdline()
const service = await getService(argv.kc, argv.sr, argv.ns)
const app = new App()
new LogtoIngressStack(
  app,
  ingress_deployment(argv),
  logtoIngressOptions(argv, service),
)
app.synth()
