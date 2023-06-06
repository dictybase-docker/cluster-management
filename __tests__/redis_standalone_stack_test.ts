import "cdktf/lib/testing/adapters/jest" // Load types for expect matchers
import { Testing, App } from "cdktf"
import { KubernetesProvider } from "@cdktf/provider-kubernetes/lib/provider"
import { Manifest } from "@cdktf/provider-kubernetes/lib/manifest"
import { RedisStandAloneStack } from "../src/construct/redis"

describe("RedisStandAloneStack", () => {
  const mockedOptions = {
    config: "/path/to/config",
    redisVersion: 5,
    redisExporterVersion: 1,
    remote: false,
    credentials: "test_cred.json",
    bucketName: "my-bucket",
    bucketPrefix: "my-prefix",
    namespace: "my-namespace",
    name: "my-redis",
    storageClass: "my-storage-class",
    storageSize: 10,
  }
  let stack: RedisStandAloneStack
  let app: App
  beforeAll(() => {
    app = Testing.app()
    stack = new RedisStandAloneStack(app, "test-redis", mockedOptions)
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
