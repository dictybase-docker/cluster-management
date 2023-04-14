import "cdktf/lib/testing/adapters/jest" // Load types for expect matchers
import { Testing, App } from "cdktf"
import { GoogleProvider } from "@cdktf/provider-google/lib/provider"
import { ComputeNetwork } from "@cdktf/provider-google/lib/compute-network"
import { ComputeSubnetwork } from "@cdktf/provider-google/lib/compute-subnetwork"
import { ComputeFirewall } from "@cdktf/provider-google/lib/compute-firewall"
import { ComputeDisk } from "@cdktf/provider-google/lib/compute-disk"
import { ComputeInstance } from "@cdktf/provider-google/lib/compute-instance"
import { K8Stack } from "../k8s"

describe("VmInstanceStack Application", () => {
  let stack: K8Stack
  let app: App
  beforeAll(() => {
    app = Testing.app()
    stack = new K8Stack(app, "test-instance")
  })
  test("check if it has google provider", () => {
    expect(Testing.synth(stack)).toHaveProvider(GoogleProvider)
  })
  test("check if it has compute network", () => {
    expect(Testing.synth(stack)).toHaveResource(ComputeNetwork)
    expect(Testing.synth(stack)).toHaveResourceWithProperties(ComputeNetwork, {
      name: "test-instance-vpc-network",
    })
    expect(Testing.synth(stack)).toHaveResource(ComputeFirewall)
  })
  test("check if it has compute subnetwork", () => {
    expect(Testing.synth(stack)).toHaveResource(ComputeSubnetwork)
    expect(Testing.synth(stack)).toHaveResourceWithProperties(
      ComputeSubnetwork,
      { name: "test-instance-vpc-subnetwork" },
    )
  })
  test("check if it has compute firewall", () => {
    expect(Testing.synth(stack)).toHaveResource(ComputeFirewall)
    expect(Testing.synth(stack)).toHaveResourceWithProperties(ComputeFirewall, {
      name: "test-instance-vpc-allow-ssh",
    })
  })
  test("check if it has compute disk for master node", () => {
    expect(Testing.synth(stack)).toHaveResource(ComputeDisk)
    expect(Testing.synth(stack)).toHaveResourceWithProperties(ComputeDisk, {
      type: "pd-ssd",
      name: "test-instance-disk-master",
      image: "rocky-linux-8-optimized-gcp-v20230306",
    })
  })
  test("check if it has compute instance", () => {
    expect(Testing.synth(stack)).toHaveResource(ComputeInstance)
    expect(Testing.synth(stack)).toHaveResourceWithProperties(ComputeInstance, {
      scheduling: {
        provisioning_model: "STANDARD",
      },
    })
  })
  test("check if the produced terraform configuration is valid", () => {
    expect(Testing.fullSynth(stack)).toBeValidTerraform()
  })
})
