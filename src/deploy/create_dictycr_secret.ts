import yargs from "yargs/yargs"
import { App } from "cdktf"
import { SecretStack } from "../construct/dictycr"

const argv = yargs(process.argv.slice(2))
  .options({
    nm: {
      type: "string",
      alias: "name",
      describe: "name of the this install",
      default: "dictycr-secret",
    },
    ns: {
      describe: "kubernetes namespace to install",
      type: "string",
      alias: "namespace",
      demandOption: true,
    },
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
    bc: {
      alias: "gcs-backup-credentials",
      type: "string",
      describe: "gcs credential file for backing up the database",
      default: "credentials/pgbackup.json",
    },
    pi: {
      alias: "project-id",
      type: "string",
      demandOption: true,
      description: "the google cloud project id",
    },
    rp: {
      alias: "restic-pass",
      type: "string",
      describe: "password of restic repository",
      demandOption: true,
    },
  })
  .help()
  .completion()
  .parseSync()

const app = new App()
const deployName = argv.nm.concat("-").concat(argv.ns)
new SecretStack(app, deployName, {
  provider: {
    config: argv.kc,
    remote: argv.r,
    credentials: argv.c,
    bucketName: argv.bn,
    bucketPrefix: deployName,
  },
  resource: {
    namespace: argv.ns,
    gcsKey: argv.bc,
    project: argv.pi,
    resticPassword: argv.rp,
  },
})
app.synth()
