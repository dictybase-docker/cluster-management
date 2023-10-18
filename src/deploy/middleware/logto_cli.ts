import yargs from "yargs/yargs"
import { type logtoArgvProperties } from "./logto_types"
import { V1Secret } from "@kubernetes/client-node"

const process_logto_cmdline = (): logtoArgvProperties =>
  yargs(process.argv.slice(2))
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

const adminService = (argv: logtoArgvProperties) => argv.nm.concat("-admin")
const apiService = (argv: logtoArgvProperties) => argv.nm.concat("-api")
const pvc = (argv: logtoArgvProperties) => argv.nm.concat("-claim")

const logtoServiceOptions = (argv: logtoArgvProperties, service: string) => {
  return {
    provider: {
      config: argv.kc,
      remote: argv.r,
      credentials: argv.c,
      bucketName: argv.bn,
      bucketPrefix: service.concat("-").concat(argv.ns),
    },
    resource: {
      namespace: argv.ns,
      port: argv.adp,
      app: argv.nm,
    },
  }
}

const logtoBackendDeploymentOptions = (
  argv: logtoArgvProperties,
  secret: V1Secret,
) => {
  return {
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
      adminService: adminService(argv),
      apiService: apiService(argv),
      claim: pvc(argv),
      adminPort: argv.adp,
      apiPort: argv.ap,
      endpoint: argv.ep,
    },
  }
}

const logtoPvcStackOptions = (argv: logtoArgvProperties) => {
  const pvc = argv.nm.concat("-claim")
  return {
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
  }
}

export {
  pvc,
  apiService,
  adminService,
  process_logto_cmdline,
  logtoPvcStackOptions,
  logtoBackendDeploymentOptions,
  logtoServiceOptions,
}
