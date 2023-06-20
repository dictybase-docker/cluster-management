import yargs from "yargs/yargs"
import { PostgresStack, PostgresSecretStack } from "../construct/postgres"
import { BucketStack } from "../construct/bucket"
import { App } from "cdktf"

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
      description: "service account credentials file for google provider",
      type: "string",
      default: "credentials/cloud-manager.json",
    },
    bn: {
      alias: "bucket-name",
      type: "string",
      default: "dicty-terraform-state",
      description: "GCS bucket name where terraform remote state is stored.",
    },
    bb: {
      alias: "backup-bucket",
      type: "string",
      demandOption: true,
      description: "GCS bucket to store the backup",
    },
    r: {
      alias: "remote",
      type: "boolean",
      default: true,
      description: "whether the remote gcs backend will be used",
    },
    rp: {
      alias: "repository",
      type: "string",
      default: "repo1",
      describe: "repository name for backing up the database with pgrest",
    },
    nm: {
      describe: "name of the install",
      alias: "name",
      type: "string",
      default: "postgres",
    },
    ns: {
      describe: "kubernetes namespace where the chart will be installed",
      type: "string",
      alias: "namespace",
      demandOption: true,
    },
    pv: {
      alias: "postgres-version",
      type: "string",
      describe:
        "postgres version to install, comes from crunchydata version numbering",
      default: "14.5-0",
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
    rg: {
      alias: "region",
      type: "string",
      description: "the google cloud region",
      default: "us-central1",
    },
    z: {
      alias: "zone",
      type: "string",
      description: "the google cloud zone",
      default: "us-central1-c",
    },
  })
  .help()
  .completion()
  .parseSync()

const app = new App()
const deployName = argv.nm.concat("-").concat(argv.ns)
new BucketStack(app, deployName.concat("-pgbackrest-backup-bucket"), {
  backend: {
    config: argv.kc,
    remote: argv.r,
    credentials: argv.c,
    bucketName: argv.bn,
    bucketPrefix: deployName,
  },
  provider: {
    credentials: argv.c,
    projectId: argv.pi,
    region: argv.rg,
    zone: argv.z,
  },
  resource: {
    bucketName: argv.bb,
  },
})
const secretStack = new PostgresSecretStack(
  app,
  deployName.concat("-gcs-secret"),
  {
    provider: {
      config: argv.kc,
      remote: argv.r,
      credentials: argv.c,
      bucketName: argv.bn,
      bucketPrefix: deployName,
    },
    resource: {
      gcsKey: argv.bc,
      namespace: argv.ns,
      repository: argv.rp,
    },
  },
)
new PostgresStack(app, deployName.concat("-postgres"), {
  provider: {
    config: argv.kc,
    remote: argv.r,
    credentials: argv.c,
    bucketName: argv.bn,
    bucketPrefix: deployName,
  },
  resource: {
    repository: argv.rp,
    secret: secretStack.secret,
    backupBucket: argv.bb,
    namespace: argv.ns,
    name: argv.nm,
    storageClass: argv.sc,
    storageSize: argv.ss,
    version: argv.pv,
  },
})
app.synth()
