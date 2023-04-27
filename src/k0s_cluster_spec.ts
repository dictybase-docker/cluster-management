import { Document, Pair, YAMLMap, YAMLSeq } from "yaml"

type SshNodeProperties = {
  address: string
  user: string
  port?: number
  keyPath: string
}

type HostNodeProperties = SshNodeProperties & {
  role: string
}

type CreateClusterYmlProperties = {
  name?: string
  version: string
  hosts: Array<HostNodeProperties>
}

const createRoleNode = (role: string) => {
  const rn = new YAMLMap()
  rn.set("role", role)
  return rn
}

const createSshNode = ({ address, user, port, keyPath }: SshNodeProperties) => {
  const ssh = new YAMLMap()
  ssh.set("ssh", new Pair("address", address))
  ssh.set("ssh", new Pair("user", user))
  ssh.set("ssh", new Pair("port", port ?? 22))
  ssh.set("ssh", new Pair("keyPath", keyPath))
  return ssh
}

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

const createK0sNode = (version: string) => {
  const k0s = new YAMLMap()
  k0s.set("k0s", new Pair("version", version))
  k0s.set("k0s", new Pair("dynamicConfig", true))
  return k0s
}

const createClusterYml = ({
  name = "dictybase-shared-cluster",
  version,
  hosts,
}: CreateClusterYmlProperties) => {
  const spec = new YAMLMap()
  spec.add(new Pair("hosts", createHostNodes(hosts)))
  spec.add(new Pair("k0s", createK0sNode(version)))
  const doc = new Document()
  doc.createPair("apiVersion", "k0sctl.k0sproject.io/v1beta1")
  doc.createPair("kind", "Cluster")
  doc.createPair("metadata", new Pair("name", name))
  doc.createPair("spec", spec)
  return doc.toString()
}

export { createClusterYml }
