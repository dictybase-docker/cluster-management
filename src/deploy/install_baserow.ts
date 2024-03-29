import yargs from "yargs/yargs"
import { V1Secret } from "@kubernetes/client-node"
import { App } from "cdktf"
import { HelmChartStack } from "../construct/helm"
import { BaserowIngressStack } from "../construct/ingress"
import { decodeSecretData, getSecret } from "../k8s"

type baseValueProperties = {
  host: string
}
type emailValuesProperties = {
  from: string
  pass: string
  user: string
} & baseValueProperties

const emailValues = ({ from, user, pass, host }: emailValuesProperties) => [
  {
    name: "backend.config.email.fromEmail",
    value: from,
  },
  {
    name: "backend.config.email.smtp",
    value: "yes",
  },
  {
    name: "backend.config.email.smtpHost",
    value: host,
  },
  {
    name: "backend.config.email.smtpPassword",
    value: pass,
  },
  {
    name: "backend.config.email.smtpUser",
    value: user,
  },
  {
    name: "backend.config.email.smtpUseTls",
    value: "yes",
  },
]
const storageValues = (storageClass: string) => [
  { name: "backend.persistence.enabled", value: "true" },
  { name: "backend.persistence.storageClassName", value: storageClass },
  { name: "backend.persistence.resources.requests.storage", value: "40Gi" },
]
const redisValues = () => [
  { name: "redis.enabled", value: "false" },
  {
    name: "externalRedis.hostname",
    value: "redis",
  },
  {
    name: "externalRedis.auth.enabled",
    value: "false",
  },
]
const postgresValues = (secret: V1Secret) => [
  { name: "postgresql.enabled", value: "false" },
  {
    name: "externalPostgresql.auth.database",
    value: decodeSecretData(secret?.data?.dbname as string),
  },
  {
    name: "externalPostgresql.auth.password",
    value: decodeSecretData(secret?.data?.password as string),
  },
  {
    name: "externalPostgresql.auth.username",
    value: decodeSecretData(secret?.data?.user as string),
  },
  {
    name: "externalPostgresql.port",
    value: decodeSecretData(secret?.data?.port as string),
  },
  {
    name: "externalPostgresql.hostname",
    value: decodeSecretData(secret?.data?.host as string),
  },
]

const argv = yargs(process.argv.slice(2))
  .options({
    bh: {
      alias: "backend-host",
      type: "string",
      describe: "backend host domain",
      demandOption: true,
    },
    fh: {
      alias: "frontend-host",
      type: "string",
      describe: "frontend host domain",
      demandOption: true,
    },
    is: {
      type: "string",
      demandOption: true,
      describe: "cert-manager issuer name",
      alias: "issuer",
    },
    fr: {
      alias: "from",
      type: "string",
      default: "Tool admin<curator-tool-admin@mail.dictycr.org>",
      describe: "email sender id",
    },
    us: {
      alias: "smtp-user",
      type: "string",
      demandOption: true,
      describe: "smtp user for authentication",
    },
    sp: {
      alias: "smtp-pass",
      type: "string",
      demandOption: true,
      describe: "smtp pass for authenticaion",
    },
    sh: {
      alias: "smpt-host",
      type: "string",
      default: "smtp.mailgun.org",
      describe: "smtp host for sending email",
    },
    nm: {
      describe: "name of the baserow install",
      alias: "name",
      type: "string",
      default: "baserow",
    },
    ns: {
      describe: "kubernetes namespace where the baserow will be installed",
      type: "string",
      alias: "namespace",
      demandOption: true,
    },
    lc: {
      describe: "local path of the chart",
      type: "string",
      alias: "local",
      demandOption: true,
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
    r: {
      alias: "remote",
      type: "boolean",
      default: true,
      description: "whether the remote gcs backend will be used",
    },
    v: {
      alias: "chart-version",
      type: "string",
      describe: "version of the chart to be deployed",
      default: "1.18.5",
    },
    kc: {
      describe: "kubernetes config file",
      type: "string",
      demandOption: true,
      alias: "kubeconfig",
    },
    sr: {
      alias: "postgres-secret",
      type: "string",
      demandOption: true,
      describe:
        "name of the secret from where postgres credentials will be extracted",
    },
    sc: {
      alias: "storage-class",
      type: "string",
      default: "dictycr-balanced",
      describle: "storage class name to use with baserow",
    },
  })
  .help()
  .completion()
  .parseSync()

const secret = await getSecret(argv.kc, argv.sr, argv.ns)
const app = new App()
const deployName = argv.nm.concat("-").concat(argv.ns)
new HelmChartStack(app, deployName, {
  config: argv.kc,
  version: argv.v,
  remote: argv.r,
  credentials: argv.c,
  bucketName: argv.bn,
  bucketPrefix: deployName,
  location: argv.lc,
  namespace: argv.ns,
  name: argv.nm,
  values: [
    ...storageValues(argv.sc),
    ...redisValues(),
    ...postgresValues(secret as V1Secret),
    ...emailValues({
      from: argv.fr,
      user: argv.us,
      pass: argv.sp,
      host: argv.sh,
    }),
    { name: "config.publicBackendUrl", value: `https://${argv.bh}` },
    { name: "config.publicFrontendUrl", value: `https://${argv.fh}` },
  ],
})

const ingressDeployName = deployName.concat("-ingress")
new BaserowIngressStack(app, ingressDeployName, {
  resource: {
    name: ingressDeployName,
    namespace: argv.ns,
    secret: deployName.concat("-ingress-tls-https"),
    issuer: argv.is,
    frontendHost: argv.fh,
    backendHost: argv.bh,
    frontendService: argv.nm.concat("-frontend"),
    backendService: argv.nm,
  },
  provider: {
    config: argv.kc,
    remote: argv.r,
    credentials: argv.c,
    bucketName: argv.bn,
    bucketPrefix: ingressDeployName,
  },
})
app.synth()
