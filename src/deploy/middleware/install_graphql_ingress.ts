import yargs from "yargs/yargs"
import { App } from "cdktf"
import { GraphqlIngressStack } from "../../construct/graphql_server"

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
      describe: "name of the this install",
      default: "graphql-ingress",
    },
    ns: {
      describe: "kubernetes namespace to install",
      type: "string",
      alias: "namespace",
      demandOption: true,
    },
    sr: {
      alias: "service",
      type: "string",
      default: "graphql-api",
      description: "name of graphql service",
    },
    sc: {
      alias: "secret",
      type: "string",
      default: "graphql-ingress-tls",
    },
    is: {
      alias: "issuer",
      type: "string",
      demandOption: true,
      describe: "name of the cert-manager issuer",
    },
    hs: {
      alias: "hosts",
      type: "array",
      describe: "list of hosts for ingress to map",
      demandOption: true,
    },
  })
  .help()
  .completion()
  .parseSync()

const app = new App()
const deployment = argv.nm.concat("-").concat(argv.ns)
new GraphqlIngressStack(app, deployment, {
  provider: {
    config: argv.kc,
    remote: argv.r,
    credentials: argv.c,
    bucketName: argv.bn,
    bucketPrefix: deployment,
  },
  resource: {
    name: argv.nm,
    namespace: argv.ns,
    secret: argv.sc,
    service: argv.sr,
    issuer: argv.is,
    backendHosts: argv.hs as Array<string>,
  },
})
app.synth()
