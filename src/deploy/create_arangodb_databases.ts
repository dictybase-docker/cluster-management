import yargs from "yargs/yargs"
import { App } from "cdktf"
import { DatabaseStack } from "../construct/arangodb"

const argv = yargs(process.argv.slice(2))
  .command("create-arango-databases", "create arangodb databases and user")
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
    au: {
      alias: "admin-user",
      type: "string",
      describe: "arangodb root user",
      default: "root",
    },
    ap: {
      alias: "admin-pass",
      type: "string",
      describe: "arangodb admin user password",
    },
    us: {
      alias: "user",
      type: "string",
      describe: "arangodb user to be created",
      demandOption: true,
    },
    pa: {
      alias: "password",
      type: "string",
      describe: "password for the user to be created",
      demandOption: true,
    },
    gr: {
      alias: "grant",
      type: "string",
      default: "rw",
      describe: "default database permission for the newly created user",
    },
    im: {
      alias: "image",
      describe: "image to use for database and user creations",
      type: "string",
      default: "dictybase/arangoadmin:develop-cdf7c20",
    },
    dbs: {
      alias: "databases",
      describe: "arangodb databases to create",
      type: "array",
      demandOption: true,
    },
  })
  .help()
  .completion()
  .parseSync()

const app = new App()
const deployName = argv.ns.concat("-").concat(argv.nm)
new DatabaseStack(app, deployName, {
  provider: {
    config: argv.kc,
    remote: argv.r,
    credentials: argv.c,
    bucketName: argv.bn,
    bucketPrefix: deployName,
  },
  resource: {
    namespace: argv.ns,
    image: argv.im,
    adminUser: argv.au,
    adminPassword: argv.ap,
    user: argv.us,
    grant: argv.gr,
    password: argv.pa,
    databases: argv.dbs as Array<string>,
  },
})
app.synth()
