import { Document, Pair, YAMLMap, YAMLSeq } from "yaml"

/**
 * @typedef {Object} SshNodeProperties
 * @property {string} address - IP address of the host
 * @property {string} user - Username of the host
 * @property {number} [port=22] - Port number of the host
 * @property {string} keyPath - Path to the private key of the host
 */
type SshNodeProperties = {
  address: string
  user: string
  port?: number
  keyPath: string
  role: string
}

/**
 * @typedef {Object} HostNodeProperties
 * @property {string} role - Role of the host
 * @property {string} address - IP address of the host
 * @property {string} user - Username of the host
 * @property {number} [port=22] - Port number of the host
 * @property {string} keyPath - Path to the private key of the host
 */
type HostNodeProperties = SshNodeProperties & {
  role: string
}

/**
 * @typedef {Object} CreateClusterYmlProperties
 * @property {string} [name="dictybase-shared-cluster"] - Name of the cluster
 * @property {string} version - Version of the k0s cluster
 * @property {Array<HostNodeProperties>} hosts - List of hosts
 */
type CreateClusterYmlProperties = {
  name?: string
  version: string
  hosts: Array<HostNodeProperties>
  enableCloudProvider: boolean
}

/**
 * Create a ssh node
 */
const createSshWithRoleNode = ({
  address,
  user,
  port,
  keyPath,
  role,
}: SshNodeProperties) => {
  const sshWithRole = new YAMLMap()
  sshWithRole.set("role", role)
  const sshProps = new YAMLMap()
  sshProps.set("address", address)
  sshProps.set("user", user)
  sshProps.set("port", port ?? 22)
  sshProps.set("keyPath", keyPath)
  sshWithRole.set("ssh", sshProps)
  return sshWithRole
}

/**
 * Create a list of host nodes
 */
const createHostNodes = (
  properties: Array<HostNodeProperties>,
  enableCloudProvider: boolean,
) => {
  const nodes = new YAMLSeq()
  properties.forEach((prop) => {
    nodes.add(createSshWithRoleNode(prop))
  })
  return nodes
}

/**
 * Create a k0s node
 */
const createK0sNode = (version: string) => {
  const k0s = new YAMLMap()
  k0s.set("version", version.concat("+k0s.0"))
  k0s.set("dynamicConfig", true)
  return k0s
}

/**
 * Create a cluster.yml file
 */
const createClusterYml = ({
  name = "dictybase-shared-cluster",
  enableCloudProvider = true,
  version,
  hosts,
}: CreateClusterYmlProperties) => {
  const spec = new YAMLMap()
  spec.set("hosts", createHostNodes(hosts, enableCloudProvider))
  spec.set("k0s", createK0sNode(version))
  const doc = new Document()
  doc.set("apiVersion", "k0sctl.k0sproject.io/v1beta1")
  doc.set("kind", "Cluster")
  doc.set("metadata", new Pair("name", name))
  doc.set("spec", spec)
  return doc.toString()
}

export { createClusterYml, type HostNodeProperties }
