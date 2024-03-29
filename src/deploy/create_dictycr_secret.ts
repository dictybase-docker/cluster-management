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
    au: {
      alias: "arangodb-user",
      type: "string",
      describe: "arangodb user name",
      default: "dictycr",
    },
    ap: {
      alias: "arangodb-password",
      type: "string",
      describe: "arangodb password",
      demandOption: true,
    },
    mu: {
      alias: "minio-user",
      type: "string",
      describe: "minio user name",
      default: "dictycr",
    },
    mp: {
      alias: "minio-password",
      type: "string",
      describe: "minio password",
      demandOption: true,
    },
    ek: {
      alias: "email-api-key",
      type: "string",
      describe: "mailgun email api key",
      demandOption: true,
    },
    tk: {
      alias: "github-token",
      type: "string",
      describe: "github token for creating issues",
      demandOption: true,
    },
    aid: {
      alias: "app-id",
      type: "string",
      describe: "appliction id of the authentication client",
      demandOption: true,
    },
    asr: {
      alias: "app-secret",
      type: "string",
      describe: "secret to access the authentication api",
      demandOption: true,
    },
    ju: {
      alias: "jwks-uri",
      type: "string",
      describe: "url to retrieve JWK public key set",
      demandOption: true,
    },
    ji: {
      alias: "jwt-issuer",
      type: "string",
      describe: "jwt issuer of the token",
      demandOption: true,
    },
    jd: {
      alias: "jwt-audience",
      type: "string",
      describe: "jwt audience of the token",
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
    cloud: {
      gcsKey: argv.bc,
      project: argv.pi,
    },
    backup: {
      resticPassword: argv.rp,
    },
    storage: {
      minioUser: argv.mu,
      minioPassword: argv.mp,
    },
    database: {
      arangodbUser: argv.au,
      arangodbPassword: argv.ap,
    },
    email: {
      APIKey: argv.ek,
      token: argv.tk,
    },
    auth: {
      appId: argv.aid,
      appSecret: argv.asr,
      JwksURI: argv.ju,
      JwtIssuer: argv.ji,
      JwtAudience: argv.jd,
    },
  },
})
app.synth()
