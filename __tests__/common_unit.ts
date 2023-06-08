import "cdktf/lib/testing/adapters/jest" // Load types for expect matchers
import { TerraformStack, Testing } from "cdktf"
import { KubernetesProvider } from "@cdktf/provider-kubernetes/lib/provider"
import { Manifest } from "@cdktf/provider-kubernetes/lib/manifest"

const testKubernetesProvider = (stack: TerraformStack) =>
  expect(Testing.synth(stack)).toHaveProvider(KubernetesProvider)

const testManifest = (stack: TerraformStack) =>
  expect(Testing.synth(stack)).toHaveResource(Manifest)

const testTerraform = (stack: TerraformStack) =>
  expect(Testing.fullSynth(stack)).toBeValidTerraform()

export { testManifest, testKubernetesProvider, testTerraform }
