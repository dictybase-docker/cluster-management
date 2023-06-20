import yargs from "yargs/yargs"
import { BucketStack } from "../construct/bucket"
import { App } from "cdktf"

const argv = yargs(process.argv.slice(2))
  .options({
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
      description: "GCS bucket to create",
    },
    r: {
      alias: "remote",
      type: "boolean",
      default: true,
      description: "whether the remote gcs backend will be used",
    },
    nm: {
      describe: "name of the install",
      alias: "name",
      type: "string",
      demandOption: true,
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
new BucketStack(app, argv.nm, {
  backend: {
    remote: argv.r,
    credentials: argv.c,
    bucketName: argv.bn,
    bucketPrefix: argv.nm,
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
app.synth()
