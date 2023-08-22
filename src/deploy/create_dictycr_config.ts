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
    gl: {
      alias: "grapqhl-publication-api",
      type: "string",
      describe: "graphql api endpoint for publication",
      demandOption: true,
    },
    pa: {
      alias: "publication-api",
      type: "string",
      describe: "api endpoint for publication",
      default: "https://www.ebi.ac.uk/europepmc/webservices/rest/search",
    },
    do: {
      alias: "domain",
      type: "string",
      describe: "domain name for sending email",
      demandOption: true,
    },
    sa: {
      alias: "sender-address",
      type: "string",
      describe: "email sender address",
      demandOption: true,
    },
    sn: {
      alias: "sender-name",
      type: "string",
      describe: "email sender name",
      demandOption: true,
    },
    go: {
      alias: "github-owner",
      type: "string",
      describe: "github owner name",
      demandOption: true,
    },
    gp: {
      alias: "github-repository",
      type: "string",
      describe: "github repository name",
      demandOption: true,
    },
    cc: {
      alias: "cc-email",
      type: "string",
      describe: "cc email address",
      demandOption: true,
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
    sender: argv.sa,
    senderName: argv.sn,
    domain: argv.do,
    repository: argv.gp,
    owner: argv.go,
    senderCc: argv.cc,
    graphlEndpoint: argv.gl,
  },
})
app.synth()
