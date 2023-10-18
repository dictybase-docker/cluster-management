import { Buffer } from "buffer"
import { KubeConfig, CoreV1Api } from "@kubernetes/client-node"

const decodeSecretData = (value: string) =>
  Buffer.from(value, "base64").toString("utf8")

const getSecret = async (config: string, secret: string, namespace: string) => {
  const kubeconfig = new KubeConfig()
  kubeconfig.loadFromFile(config)
  const res = await kubeconfig
    .makeApiClient(CoreV1Api)
    .readNamespacedSecret(secret, namespace)
  return res.body
}
const getService = async (
  config: string,
  service: string,
  namespace: string,
) => {
  const kubeconfig = new KubeConfig()
  kubeconfig.loadFromFile(config)
  const res = await kubeconfig
    .makeApiClient(CoreV1Api)
    .readNamespacedService(service, namespace)
  return res.body
}

export { decodeSecretData, getSecret, getService }
