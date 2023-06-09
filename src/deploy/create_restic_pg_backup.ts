import yargs from "yargs/yargs"
import { App } from "cdktf"
import { PostgresBackupStack } from "../construct/restic"

const argv = yargs(process.argv.slice(2))
  .options({
    nm: {
      type: "string",
      alias: "name",
      describe: "name of the this install",
      demandOption: true,
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
    bb: {
      alias: "backup-bucket",
      type: "string",
      demandOption: true,
      describe: "gcs bucket for backup",
    },
    ds: {
      alias: "dictycr-secret",
      describe: "dictycr secret which contains the restic credentials",
      type: "string",
      demandOption: true,
    },
    ps: {
      alias: "pg-secret",
      describe: "postgres secret which contains the database credentials",
      type: "string",
      demandOption: true,
    },
    db: {
      alias: "database",
      describe: "postgres database that will be backed up",
      type: "string",
      demandOption: true,
    },
    im: {
      alias: "backup-image",
      describe: "image to use for backup job",
      type: "string",
      default: "dictybase/resticpg:develop-393cb4e",
    },
  })
  .help()
  .completion()
  .parseSync()

const app = new App()
const deployName = argv.ns.concat("-").concat(argv.nm)
new PostgresBackupStack(app, deployName, {
  provider: {
    config: argv.kc,
    remote: argv.r,
    credentials: argv.c,
    bucketName: argv.bn,
    bucketPrefix: deployName,
  },
  resource: {
    namespace: argv.ns,
    secretName: argv.ds,
    image: argv.im,
    backupBucketName: argv.bb,
    pgSecretName: argv.ps,
    database: argv.db,
  },
})
app.synth()
