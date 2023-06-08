import "cdktf/lib/testing/adapters/jest" // Load types for expect matchers
import { Testing, App } from "cdktf"
import { KubernetesProvider } from "@cdktf/provider-kubernetes/lib/provider"
import { Manifest } from "@cdktf/provider-kubernetes/lib/manifest"
import { ArangodbSingleStack } from "../src/construct/arangodb"

describe("ArangodbSingleStack", () => {
  const mockedOptions = {
    provider: {
      config: "/path/to/config",
      remote: false,
      credentials: "test_cred.json",
      bucketName: "my-bucket",
      bucketPrefix: "my-prefix",
    },
    resource: {
      namespace: "my-namespace",
      name: "my-redis",
      storageClass: "my-storage-class",
      storageSize: 10,
      arangodbVersion: "3.5.4",
      arangodbExporterVersion: "3.4.0",
    },
  }
  let stack: ArangodbSingleStack
  let app: App
  beforeAll(() => {
    app = Testing.app()
    stack = new ArangodbSingleStack(app, "test-arango", mockedOptions)
  })
  test("check if it has kubernetes provider", () => {
    expect(Testing.synth(stack)).toHaveProvider(KubernetesProvider)
  })
  test("check if it has manifest resource", () => {
    expect(Testing.synth(stack)).toHaveResource(Manifest)
  })
  test("check if the produced terraform configuration is valid", () => {
    expect(Testing.fullSynth(stack)).toBeValidTerraform()
  })
})
