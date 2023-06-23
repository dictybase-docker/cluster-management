import yargs from "yargs/yargs"
import { KubeConfig, CoreV1Api, V1Secret } from "@kubernetes/client-node"
import { Buffer } from "buffer"
import { HelmChartStack } from "../construct/helm"
import { App } from "cdktf"

type emailValuesProperties = {
  from: string
  host: string
  pass: string
  user: string
}

const emailValues = ({ from, user, pass, host }: emailValuesProperties) => [
  {
    name: "backend.config.email.fromEmail",
    value: from,
  },
  {
    name: "backend.config.email.smtp",
    value: "true",
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
    value: "true",
  },
]

const storageValues = (storageClass: string) => [
  { name: "persistence.enabled", value: "true" },
  { name: "persistence.storageClassName", value: storageClass },
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

const decodeSecretData = (value: string) =>
  Buffer.from(value, "base64").toString("utf8")

const getSecret = async (config: string, secret: string, namespace: string) => {
  const kubeconfig = new KubeConfig()
  kubeconfig.loadFromFile(config)
  const res = await kubeconfig
    .makeApiClient(CoreV1Api)
    .listNamespacedSecret(namespace)
  return res.body.items.find((sec) => sec.metadata?.name === secret)
}

const argv = yargs(process.argv.slice(2))
  .options({
    fr: {
      alias: "from",
      type: "string",
      default: "curator-tool-manager@mail.dictycr.org",
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
      describe: "smtp host for sening email",
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
    ch: {
      describe: "name of the chart",
      type: "string",
      alias: "chart",
      default: "baserow",
    },
    repo: {
      describe: "baserow helm chart reposotiry location",
      type: "string",
      alias: "repository",
      default: "https://christianknell.github.io/helm-charts",
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
    s: {
      alias: "name",
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

const secret = await getSecret(argv.kc, argv.s, argv.ns)
const app = new App()
const deployName = argv.nm.concat("-").concat(argv.ns)
new HelmChartStack(app, deployName, {
  config: argv.kc,
  version: argv.v,
  remote: argv.r,
  credentials: argv.c,
  bucketName: argv.bn,
  bucketPrefix: deployName,
  repo: argv.repo,
  namespace: argv.ns,
  chart: argv.ch,
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
  ],
})
app.synth()
