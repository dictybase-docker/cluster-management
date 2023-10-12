import { Buffer } from "buffer"
import { KubeConfig, CoreV1Api } from "@kubernetes/client-node"

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

export { decodeSecretData, getSecret }
