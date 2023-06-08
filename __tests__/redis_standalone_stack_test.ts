import "cdktf/lib/testing/adapters/jest" // Load types for expect matchers
import { Testing, App } from "cdktf"
import { RedisStandAloneStack } from "../src/construct/redis"
import {
  testManifest,
  testKubernetesProvider,
  testTerraform,
} from "./common_unit"

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
  test("check if it has kubernetes provider", () =>
    testKubernetesProvider(stack))
  test("check if it has manifest resource", () => testManifest(stack))
  test("check if the produced terraform configuration is valid", () =>
    testTerraform(stack))
})
