import yargs from "yargs/yargs"
import { App } from "cdktf"
import { ConfigMapStack } from "../construct/dictycr"

const argv = yargs(process.argv.slice(2))
  .options({
    nm: {
      type: "string",
      alias: "name",
      describe: "name of the this install",
      default: "dictycr-configuration",
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
    oa: {
      alias: "organism-api",
      type: "string",
      describe: "api endpoint for organism",
      default:
        "https://raw.githubusercontent.com/dictyBase/migration-data/master/downloads/organisms-with-citations.staging.json",
    },
    pa: {
      alias: "publication-api",
      type: "string",
      describe: "api endpoint for publication",
      default: "https://www.ebi.ac.uk/europepmc/webservices/rest/search",
    },
  })
  .help()
  .completion()
  .parseSync()

const app = new App()
const deployName = argv.nm.concat("-").concat(argv.ns)
new ConfigMapStack(app, argv.nm, {
  provider: {
    config: argv.kc,
    remote: argv.r,
    credentials: argv.c,
    bucketName: argv.bn,
    bucketPrefix: deployName,
  },
  resource: {
    namespace: argv.ns,
    publication: argv.pa,
    organism: argv.oa,
  },
})
app.synth()