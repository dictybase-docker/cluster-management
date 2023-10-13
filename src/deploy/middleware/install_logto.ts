import yargs from "yargs/yargs"
import { V1Secret } from "@kubernetes/client-node"
import { App } from "cdktf"
import {
  LogtoPersistentVolumeClaimStack,
  LogtoBackendDeploymentStack,
} from "../../construct/middleware/logto"
import { getSecret } from "../../k8s"

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
  })
  .help()
  .completion()
  .parseSync()

const secret = await getSecret(argv.kc, argv.sr, argv.ns)
const app = new App()
new LogtoPersistentVolumeClaimStack(app, argv.nm, {
  provider: {
    config: argv.kc,
    remote: argv.r,
    credentials: argv.c,
    bucketName: argv.bn,
    bucketPrefix: argv.nm.concat("-volume-claim-").concat(argv.ns),
  },
  resource: {
    namespace: argv.ns,
    diskSize: argv.ss,
    storageClass: argv.sc,
  },
})
new LogtoBackendDeploymentStack(app, argv.nm, {
  provider: {
    config: argv.kc,
    remote: argv.r,
    credentials: argv.c,
    bucketName: argv.bn,
    bucketPrefix: argv.nm.concat(argv.ns),
  },
  resource: {
    namespace: argv.ns,
    image: argv.im,
    tag: argv.tg,
    secret: secret as V1Secret,
    adminService: argv.nm.concat("-admin"),
    apiService: argv.nm.concat("-api"),
    claim: argv.nm,
    adminPort: argv.adp,
    apiPort: argv.ap,
  },
})
app.synth()
