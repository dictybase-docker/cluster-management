import { createClusterYml, TagMatcher } from "../src/k0s_cluster"
import { parseDocument, Document, isSeq, isMap } from "yaml"
import { hosts } from "./cluster_data"

describe("createClusterYml", () => {
  let yamlObj: Document
  let actualYaml: string
  beforeEach(async () => {
    actualYaml = await createClusterYml({
      version: "1.23.4",
      hosts,
    })
    yamlObj = parseDocument(actualYaml)
  })
  test("it should have apiVersion, kind and metadata", () => {
    expect(yamlObj.get("apiVersion")).toBe("k0sctl.k0sproject.io/v1beta1")
    expect(yamlObj.get("kind")).toBe("Cluster")
    expect(yamlObj.getIn(["metadata", "name"])).toBe("dictybase-shared-cluster")
  })
  test("it should have k0s node with its properties", () => {
    expect(yamlObj.getIn(["spec", "k0s", "version"])).toBe("1.23.4+k0s.0")
    expect(yamlObj.getIn(["spec", "k0s", "dynamicConfig"])).toBeTruthy()
  })
  test("it should have multiple hosts with ssh and role nodes", () => {
    const hosts = yamlObj.getIn(["spec", "hosts"])
    if (isSeq(hosts)) {
      expect(hosts.items).toHaveLength(3)
      hosts.items.forEach((item) => {
        if (isMap(item)) {
          expect(item.getIn(["ssh", "port"])).toBe(22)
          expect(item.getIn(["ssh", "user"])).toBe("root")
          expect(item.getIn(["ssh", "keyPath"])).toBe("~/.ssh/id_rsa")
        }
      })
      const firstHost = hosts.items.at(0)
      const lastHost = hosts.items.at(-1)
      if (isMap(firstHost) && isMap(lastHost)) {
        expect(firstHost.get("role")).toBe("controller")
        expect(firstHost.getIn(["ssh", "address"])).toBe("10.0.0.1")
        expect(lastHost.get("role")).toBe("worker")
        expect(lastHost.getIn(["ssh", "address"])).toBe("10.0.0.3")
      }
    }
  })
})

describe("TagMatcher", () => {
  let tagMatcher: TagMatcher
  beforeEach(() => {
    tagMatcher = new TagMatcher({
      token: "4387rq90wufdilfhhdsfydsfids",
      owner: "ccm",
      repo: "ccm",
    })
  })
  test("should return the first tag that matches the given version", async () => {
    const actualTag = await tagMatcher.match_tag("1.26.1")
    expect(actualTag).toEqual("ccm/v26.4.0")
  })
  test("should return the download URL for the given path and tag", async () => {
    const actualUrl = await tagMatcher.download_url({
      path: "deploy/packages/default/manifest.yaml",
      tag: "ccm/v26.4.0",
    })
    expect(actualUrl).toEqual(
      "https://raw.githubusercontent.com/kubernetes/cloud-provider-gcp/ccm/v26.4.0/deploy/packages/default/manifest.yaml",
    )
  })
})

describe("createClusterYml with cloud provider", () => {
  let yamlObj: Document
  let actualYaml: string
  beforeEach(async () => {
    actualYaml = await createClusterYml({
      version: "1.26.1",
      hosts,
      cloudProvider: {
        githubToken: "4839qtyweiofhdshfsdy23s",
      },
    })
    yamlObj = parseDocument(actualYaml)
  })

  test("it should have install flags for cloud provider", () => {
    const hosts = yamlObj.getIn(["spec", "hosts"])
    if (isSeq(hosts)) {
      hosts.items.slice(1).forEach((h) => {
        if (isMap(h)) {
          const flags = h.get("installFlags")
          if (isSeq(flags)) {
            expect(flags.get(0)).toBe("--enable-cloud-provider")
            expect(flags.get(1)).toBe(
              "--kubelet-extra-args='--cloud-provider=external'",
            )
          }
        }
      })
    }
  })
  test("it should have controller hosts with file node", () => {
    const hosts = yamlObj.getIn(["spec", "hosts"])
    if (isSeq(hosts)) {
      const controllerHost = hosts.items.find(
        (item) => isMap(item) && item.get("role") === "controller",
      )
      if (isMap(controllerHost)) {
        const files = controllerHost.get("files")
        if (isSeq(files)) {
          const fileContent = files.get(0)
          if (isMap(fileContent)) {
            expect(fileContent.get("dstDir")).toBe("/var/lib/k0s/manifests/gcp")
            expect(fileContent.get("name")).toBe("gcp-manifest")
            expect(fileContent.get("perm")).toBe("0600")
            expect(fileContent.get("src")).toBe(
              "https://raw.githubusercontent.com/kubernetes/cloud-provider-gcp/ccm/v26.4.0/deploy/packages/default/manifest.yaml",
            )
          }
        }
      }
    }
  })
})
