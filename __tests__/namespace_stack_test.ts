import "cdktf/lib/testing/adapters/jest" // Load types for expect matchers
import { Testing, App } from "cdktf"
import { KubernetesProvider } from "@cdktf/provider-kubernetes/lib/provider"
import { NamespaceStack } from "../src/construct/namespace"
import { Namespace } from "@cdktf/provider-kubernetes/lib/namespace"

describe("RedisStandAloneStack", () => {
  const mockedOptions = {
    config: "/path/to/config",
    remote: false,
    credentials: "test_cred.json",
    bucketName: "my-bucket",
    bucketPrefix: "my-prefix",
    namespace: "my-namespace",
  }
  let stack: NamespaceStack
  let app: App
  beforeAll(() => {
    app = Testing.app()
    stack = new NamespaceStack(app, "test-namespace", mockedOptions)
  })
  test("check if it has kubernetes provider", () => {
    expect(Testing.synth(stack)).toHaveProvider(KubernetesProvider)
  })
  test("check if it has namespace resource", () => {
    expect(Testing.synth(stack)).toHaveResource(Namespace)
  })
  test("check if the produced terraform configuration is valid", () => {
    expect(Testing.fullSynth(stack)).toBeValidTerraform()
  })
})
