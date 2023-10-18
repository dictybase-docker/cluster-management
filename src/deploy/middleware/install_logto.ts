import yargs from "yargs/yargs"
import { V1Secret } from "@kubernetes/client-node"
import { App } from "cdktf"
import {
  LogtoPersistentVolumeClaimStack,
  LogtoBackendDeploymentStack,
} from "../../construct/middleware/logto"
import { getSecret } from "../../k8s"
import { BackendService } from "../../construct/dictycr"

const argv = yargs(process.argv.slice(2))
  .options({
    kc: {
      describe: "kubernetes config file",
      type: "string",
      demandOption: true,
      alias: "kubeconfig",
    },
    c: {
      alias: "credentials",
      description: "service account credentials file for gcs backend",
      type: "string",
      default: "credentials/cloud-manager.json",
    },
    bn: {
      alias: "bucket-name",
      type: "string",
      default: "dicty-terraform-state",
      description: "GCS bucket name where terraform remote state is stored.",
    },
    r: {
      alias: "remote",
      type: "boolean",
      default: true,
      description: "whether the remote gcs backend will be used",
    },
    nm: {
      type: "string",
      alias: "name",
      default: "logto",
      describe: "name of the this install",
    },
    ns: {
      describe: "kubernetes namespace to install",
      type: "string",
      alias: "namespace",
      demandOption: true,
    },
    im: {
      alias: "image",
      describe: "image to use for logto",
      type: "string",
      default: "svhd/logto",
    },
    tg: {
      alias: "tag",
      describe: "tag of the image",
      type: "string",
      demandOption: true,
    },
    sc: {
      alias: "storage-class",
      type: "string",
      describe: "name of storage class to use for persistence",
      default: "dictycr-balanced",
    },
    ss: {
      alias: "storage-size",
      type: "number",
      describle: "size of the storage in GB",
      default: 30,
    },
    sr: {
      alias: "postgres-secret",
      type: "string",
      demandOption: true,
      describe:
        "name of the secret from where postgres credentials will be extracted",
    },
    adp: {
      alias: "admin-port",
      type: "number",
      default: 3002,
      description: "port where admin console will be listening",
    },
    ap: {
      alias: "api-port",
      type: "number",
      default: 3001,
      describe: "port where logto will be listening",
    },
    db: {
      alias: "database",
      type: "string",
      default: "dictycr_auth",
      describe: "name of logto database",
    },
    ep: {
      alias: "endpoint",
      type: "string",
      describe: "http endpoint for logto backend api service",
      demandOption: true,
    },
  })
  .help()
  .completion()
  .parseSync()

const secret = await getSecret(argv.kc, argv.sr, argv.ns)
const app = new App()
const pvc = argv.nm.concat("-claim")
new LogtoPersistentVolumeClaimStack(app, pvc, {
  provider: {
    config: argv.kc,
    remote: argv.r,
    credentials: argv.c,
    bucketName: argv.bn,
    bucketPrefix: pvc.concat(argv.ns),
  },
  resource: {
    namespace: argv.ns,
    diskSize: argv.ss,
    storageClass: argv.sc,
  },
})
const adminService = argv.nm.concat("-admin")
const apiService = argv.nm.concat("-api")
new LogtoBackendDeploymentStack(app, argv.nm, {
  provider: {
    config: argv.kc,
    remote: argv.r,
    credentials: argv.c,
    bucketName: argv.bn,
    bucketPrefix: argv.nm.concat(argv.ns),
  },
  resource: {
    database: argv.db,
    namespace: argv.ns,
    image: argv.im,
    tag: argv.tg,
    secret: secret as V1Secret,
    adminService: adminService,
    apiService: apiService,
    claim: pvc,
    adminPort: argv.adp,
    apiPort: argv.ap,
    endpoint: argv.ep,
  },
})
new BackendService(app, adminService, {
  provider: {
    config: argv.kc,
    remote: argv.r,
    credentials: argv.c,
    bucketName: argv.bn,
    bucketPrefix: adminService.concat("-").concat(argv.ns),
  },
  resource: {
    namespace: argv.ns,
    port: argv.adp,
    app: argv.nm,
  },
})
new BackendService(app, apiService, {
  provider: {
    config: argv.kc,
    remote: argv.r,
    credentials: argv.c,
    bucketName: argv.bn,
    bucketPrefix: apiService.concat("-").concat(argv.ns),
  },
  resource: {
    namespace: argv.ns,
    port: argv.adp,
    app: argv.nm,
  },
})
app.synth()
