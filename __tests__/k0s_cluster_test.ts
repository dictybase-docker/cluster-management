import { createClusterYml } from "../src/k0s_cluster"
import { parseDocument, Document, isSeq, isMap } from "yaml"
import { hosts } from "./cluster_data"

describe("createClusterYml", () => {
  let yamlObj: Document
  let actualYaml: string
  beforeEach(() => {
    actualYaml = createClusterYml({
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
