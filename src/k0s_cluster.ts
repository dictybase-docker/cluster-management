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
}

/**
 * Create a role node
 */
const createRoleNode = (role: string) => {
  return new Pair("role", role)
}

/**
 * Create a ssh node
 */
const createSshNode = ({ address, user, port, keyPath }: SshNodeProperties) => {
  const ssh = new YAMLMap()
  ssh.set("ssh", new Pair("address", address))
  ssh.set("ssh", new Pair("user", user))
  ssh.set("ssh", new Pair("port", port ?? 22))
  ssh.set("ssh", new Pair("keyPath", keyPath))
  return ssh
}

/**
 * Create a list of host nodes
 */
const createHostNodes = (properties: Array<HostNodeProperties>) => {
  const nodes = new YAMLSeq()
  properties.forEach(({ address, port, user, keyPath, role }) => {
    nodes.add({
      ...createRoleNode(role),
      ...createSshNode({ address, port, user, keyPath }),
    })
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
  version,
  hosts,
}: CreateClusterYmlProperties) => {
  const spec = new YAMLMap()
  spec.set("hosts", createHostNodes(hosts))
  spec.set("k0s", createK0sNode(version))
  const doc = new Document()
  doc.set("apiVersion", "k0sctl.k0sproject.io/v1beta1")
  doc.set("kind", "Cluster")
  doc.set("metadata", new Pair("name", name))
  doc.set("spec", spec)
  return doc.toString()
}

export { createClusterYml }
