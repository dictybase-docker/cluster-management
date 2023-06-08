import "cdktf/lib/testing/adapters/jest" // Load types for expect matchers
import { HelmProvider } from "@cdktf/provider-helm/lib/provider"
import { Testing, App } from "cdktf"
import { Release } from "@cdktf/provider-helm/lib/release"
import { HelmChartStack } from "../src/construct/helm"
import { testTerraform } from "./common_unit"

describe("HelmChartStack", () => {
  const mockedOptions = {
    config: "kubeconfig.yml",
    version: "1.2",
    remote: false,
    credentials: "test_cred.json",
    bucketName: "my-bucket",
    bucketPrefix: "my-prefix",
    repo: "my-repo",
    namespace: "my-namespace",
    chart: "my-chart",
    name: "my-release",
    values: [{ name: "name", value: "value" }],
  }
  let stack: HelmChartStack
  let app: App
  beforeAll(() => {
    app = Testing.app()
    stack = new HelmChartStack(app, "test-helm", mockedOptions)
  })
  test("check if it has helm provider", () => {
    expect(Testing.synth(stack)).toHaveProvider(HelmProvider)
  })
  test("check if has release resource", () => {
    expect(Testing.synth(stack)).toHaveResource(Release)
  })
  test("check if the produced terraform configuration is valid", () =>
    testTerraform(stack))
})
