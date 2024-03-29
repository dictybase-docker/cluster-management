import { App } from "cdktf"
import { HelmChartStack } from "../construct/helm"
import { NatsBackendService } from "../construct/dictycr"
import yargs from "yargs/yargs"
import { KubeConfig, CoreV1Api } from "@kubernetes/client-node"
import { getLogger } from "../kops/log"

type listServicesProperties = {
  config: string
  namespace: string
}

type deleteServicesProperties = listServicesProperties & {
  name: string
  level: string
}

const listServices = async ({ config, namespace }: listServicesProperties) => {
  const kubeconfig = new KubeConfig()
  kubeconfig.loadFromFile(config)
  const k8sApi = kubeconfig.makeApiClient(CoreV1Api)
  const res = await k8sApi.listNamespacedService(namespace)
  return res.body.items.map((item) => item.metadata?.name)
}

const deleteService = async ({
  config,
  namespace,
  level,
  name,
}: deleteServicesProperties) => {
  const logger = getLogger(level)
  const services = await listServices({ config, namespace })
  logger.debug("got services %s", services.join("  "))
  const serviceRemove = services.find((srv) => srv === name)
  if (!serviceRemove) {
    logger.info("service %s is not installed in cluster", name)
    return
  }
  const kubeconfig = new KubeConfig()
  kubeconfig.loadFromFile(config)
  const k8sApi = kubeconfig.makeApiClient(CoreV1Api)
  const output = await k8sApi.deleteNamespacedService(name, namespace)
  logger.info("service %s deleted", name)
  logger.debug(output.body.status?.conditions)
}

const argv = yargs(process.argv.slice(2))
  .options({
    nm: {
      describe:
        "name of the nats install. This will be used to name both the deployment and service",
      alias: "name",
      type: "string",
      default: "nats",
    },
    ns: {
      describe: "kubernetes namespace where the nats will be installed",
      type: "string",
      alias: "namespace",
      demandOption: true,
    },
    ch: {
      describe: "name of the chart",
      type: "string",
      alias: "chart",
      default: "nats",
    },
    repo: {
      describe: "nats helm chart reposotiry location",
      type: "string",
      alias: "repository",
      default: "https://nats-io.github.io/k8s/helm/charts",
    },
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
      default: "0.19.14",
    },
    nv: {
      alias: "nats-version",
      type: "string",
      describe: "nats version",
      default: "2.9.17-alpine",
    },
    l: {
      describe: "logging level",
      type: "string",
      alias: "level",
      default: "info",
    },
  })
  .help()
  .completion()
  .parseSync()

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
  name: argv.nm, // this app name should match the app attributes passed in the service
  values: [{ name: "container.image.tag", value: argv.nv }],
})
await deleteService({
  config: argv.kc,
  namespace: argv.ns,
  level: argv.l,
  name: argv.nm,
})
new NatsBackendService(app, argv.nm, {
  provider: {
    config: argv.kc,
    remote: argv.r,
    credentials: argv.c,
    bucketName: argv.bn,
    bucketPrefix: argv.nm.concat("-service-").concat(argv.ns),
  },
  resource: {
    namespace: argv.ns,
    app: argv.nm, // this should match the value of name attribute passed in the helm chart
  },
})
app.synth()
