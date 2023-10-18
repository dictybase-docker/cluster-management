import { V1Secret } from "@kubernetes/client-node"
import { App } from "cdktf"
import {
  LogtoPersistentVolumeClaimStack,
  LogtoBackendDeploymentStack,
} from "../../construct/middleware/logto"
import { getSecret } from "../../k8s"
import { BackendService } from "../../construct/dictycr"
import {
  process_logto_cmdline,
  pvc,
  apiService,
  adminService,
  logtoPvcStackOptions,
  logtoBackendDeploymentOptions,
  logtoServiceOptions,
} from "./logto_cli"

const argv = process_logto_cmdline()
const secret = await getSecret(argv.kc, argv.sr, argv.ns)
const app = new App()
new LogtoPersistentVolumeClaimStack(app, pvc(argv), logtoPvcStackOptions(argv))
new LogtoBackendDeploymentStack(
  app,
  argv.nm,
  logtoBackendDeploymentOptions(argv, secret as V1Secret),
)
new BackendService(
  app,
  adminService(argv),
  logtoServiceOptions(argv, adminService(argv)),
)
new BackendService(
  app,
  apiService(argv),
  logtoServiceOptions(argv, apiService(argv)),
)
app.synth()
