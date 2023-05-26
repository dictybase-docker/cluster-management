import yargs from "yargs/yargs"
import { KubeConfig, StorageV1Api } from "@kubernetes/client-node"
import { getLogger } from "../kops/log"

type deleteStorageClassProperties = {
  config: string
  name: string
  level: string
}

type createStorageClassProperties = deleteStorageClassProperties & {
  diskType: string
}

const listStorage = async (config: string) => {
  const kubeconfig = new KubeConfig()
  kubeconfig.loadFromFile(config)
  const k8sApi = kubeconfig.makeApiClient(StorageV1Api)
  const res = await k8sApi.listStorageClass()
  return res.body.items.map((sc) => sc.metadata?.name)
}

const deleteStorageClass = async ({
  name,
  config,
  level,
}: deleteStorageClassProperties) => {
  const logger = getLogger(level)
  try {
    const storages = await listStorage(config)
    if (!storages.includes(name)) {
      logger.warn("storage class %s is not present, cannot be deleted", name)
      return
    }
    const kubeconfig = new KubeConfig()
    kubeconfig.loadFromFile(config)
    await kubeconfig.makeApiClient(StorageV1Api).deleteStorageClass(name)
    logger.info("deleted storage class %s", name)
  } catch (error) {
    logger.error(error)
  }
}

const createStorageClass = async ({
  name,
  config,
  diskType,
  level,
}: createStorageClassProperties) => {
  const logger = getLogger(level)
  try {
    const storages = await listStorage(config)
    if (storages.includes(name)) {
      logger.warn("storage class %s is present not created", name)
      return
    }
    const kubeconfig = new KubeConfig()
    kubeconfig.loadFromFile(config)
    const k8sApi = kubeconfig.makeApiClient(StorageV1Api)
    const storageClass = {
      apiVersion: "storage.k8s.io/v1",
      kind: "StorageClass",
      metadata: {
        name: name,
      },
      provisioner: "pd.csi.storage.gke.io",
      volumeBindingMode: "WaitForFirstConsumer",
      allowVolumeExpansion: true,
      parameters: {
        type: diskType,
      },
    }
    await k8sApi.createStorageClass(storageClass)
    logger.info("create storage class %s", name)
  } catch (error) {
    logger.error(error)
  }
}

yargs(process.argv.slice(2))
  .command("list", "list kubernetes storgae classes", {}, async (argv) => {
    // @ts-ignore
    const logger = getLogger(argv.l)
    try {
      // @ts-ignore
      const storages = await listStorage(argv.kc)
      logger.info(storages)
    } catch (err) {
      logger.error(err)
    }
  })
  .command(
    "create",
    "create kubernete storage class",
    {
      n: {
        alias: "name",
        type: "string",
        demandOption: true,
        describe: "name of the storage class",
      },
      d: {
        alias: "disk-type",
        type: "string",
        describe: "type of google cloud disk to create",
        default: "pd-balanced",
      },
    },
    async (argv) => {
      await createStorageClass({
        // @ts-ignore
        config: argv.kc,
        // @ts-ignore
        level: argv.l,
        name: argv.n,
        diskType: argv.d,
      })
    },
  )
  .command(
    "delete",
    "delete kubernetes storage class",
    {
      n: {
        alias: "name",
        type: "string",
        demandOption: true,
        describe: "name of the storage class",
      },
    },
    async (argv) => {
      // @ts-ignore
      await deleteStorageClass({ config: argv.kc, level: argv.l, name: argv.n })
    },
  )
  .options({
    kc: {
      describe: "kubernetes config file",
      type: "string",
      demandOption: true,
      alias: "kubeconfig",
      default: process.env.KUBECONFIG,
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
  .parse()
