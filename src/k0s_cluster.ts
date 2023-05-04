import { Document, Pair, YAMLMap, YAMLSeq } from "yaml"
import { Octokit } from "@octokit/rest"

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
  cloudProvider?: {
    githubToken: string
  }
}

/**
 * @typedef {Object} TagMatcherProperties
 * @property {string} owner - Owner of the repository
 * @property {string} repo - Name of the repository
 * @property {string} token - Github token
 */
type TagMatcherProperties = {
  owner: string
  repo: string
  token: string
}

/**
 * @typedef {Object} SortProperties
 * @property {string} name - Name of the tag
 * @property {string} match - Version of the tag
 */
type SortProperties = {
  name: string
  match: string
}

type DownloadUrlProperties = {
  path: string
  tag: string
}

type CreateHostNodesProperties = {
  hosts: Array<HostNodeProperties>
  enableCloudProvider: boolean
  url?: string
}

const extractMinorVersion = (version: string) => version.split(".")[1]
const semanticVersion = (a: SortProperties, b: SortProperties) => {
  const [majorA, minorA, patchA] = a.match.split(".").map((v) => Number(v))
  const [majorB, minorB, patchB] = b.match.split(".").map((v) => Number(v))
  switch (true) {
    case majorA !== majorB:
      return majorB - majorA
    case minorA !== minorB:
      return minorB - minorA
    default:
      return patchB - patchA
  }
}

/**
 * Class for matching tags
 */
class TagMatcher {
  #apiHandler: Octokit
  #owner: string
  #repo: string
  constructor({ token, owner, repo }: TagMatcherProperties) {
    this.#apiHandler = new Octokit({ auth: token })
    this.#owner = owner
    this.#repo = repo
  }
  async match_tag(version: string) {
    const minor = extractMinorVersion(version)
    const rgxp = new RegExp(`^ccm\/v(${minor}\.[0-9]+\.[0-9]+)`)
    const tags = await this.#apiHandler.rest.repos.listTags({
      owner: this.#owner,
      repo: this.#repo,
    })
    const names = tags.data
      .filter((t) => rgxp.test(t.name))
      .map((t) => ({
        name: t.name,
        rgxp: rgxp.exec(t.name) as RegExpExecArray,
      }))
      .map(({ name, rgxp }) => ({ name, match: rgxp[1] as string }))
      .sort(semanticVersion)
    return names.at(0)?.name
  }
  async download_url({ path, tag }: DownloadUrlProperties) {
    const resp = await this.#apiHandler.rest.repos.getContent({
      owner: this.#owner,
      repo: this.#repo,
      path: path,
      ref: tag,
    })
    // @ts-ignore
    return resp.data.download_url
  }
}

/**
 * Create a file node for GCP manifest
 */
const createGcpFileNode = (url: string) => {
  const fileNode = new YAMLMap()
  fileNode.set("name", "gcp-manifest")
  fileNode.set("src", url)
  fileNode.set("dstDir", "/var/lib/k0s/manifests/gcp")
  fileNode.set("perm", "0600")
  const fileContainer = new YAMLSeq()
  fileContainer.add(fileNode)
  return fileContainer
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
 * Create a list of cloud provider flags
 */
const addCloudProvider = () => {
  const cloudFlags = new YAMLSeq()
  cloudFlags.add("--enable-cloud-provider")
  cloudFlags.add("--kubelet-extra-args='--cloud-provider=external'")
  return cloudFlags
}

/**
 * Create a list of host nodes
 */
const createHostNodes = ({
  hosts,
  enableCloudProvider,
  url,
}: CreateHostNodesProperties) => {
  const nodes = new YAMLSeq()
  hosts.forEach((prop) => {
    const sshroleNode = createSshWithRoleNode(prop)
    if (enableCloudProvider) {
      switch (prop.role) {
        case "worker":
          sshroleNode.set("installFlags", addCloudProvider())
          break
        case "controller":
          sshroleNode.set("files", createGcpFileNode(url as string))
          break
      }
    }
    nodes.add(sshroleNode)
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
const createClusterYml = async ({
  name = "dictybase-shared-cluster",
  version,
  hosts,
  cloudProvider,
}: CreateClusterYmlProperties) => {
  const spec = new YAMLMap()
  if (cloudProvider) {
    const tagMatch = new TagMatcher({
      token: cloudProvider.githubToken,
      owner: "kubernetes",
      repo: "cloud-provider-gcp",
    })
    const tag = await tagMatch.match_tag(version)
    if (tag) {
      const url = await tagMatch.download_url({
        path: "deploy/packages/default/manifest.yaml",
        tag,
      })
      spec.set(
        "hosts",
        createHostNodes({ hosts, enableCloudProvider: true, url }),
      )
    }
  } else {
    spec.set("hosts", createHostNodes({ hosts, enableCloudProvider: false }))
  }
  spec.set("k0s", createK0sNode(version))
  const doc = new Document()
  doc.set("apiVersion", "k0sctl.k0sproject.io/v1beta1")
  doc.set("kind", "Cluster")
  doc.set("metadata", new Pair("name", name))
  doc.set("spec", spec)
  return doc.toString()
}

export { createClusterYml, type HostNodeProperties, TagMatcher }
