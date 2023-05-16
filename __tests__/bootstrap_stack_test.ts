import "cdktf/lib/testing/adapters/jest" // Load types for expect matchers
import { Testing, App } from "cdktf"
import { GoogleProvider } from "@cdktf/provider-google/lib/provider"
import { ComputeNetwork } from "@cdktf/provider-google/lib/compute-network"
import { ComputeSubnetwork } from "@cdktf/provider-google/lib/compute-subnetwork"
import { ComputeFirewall } from "@cdktf/provider-google/lib/compute-firewall"
import { ComputeDisk } from "@cdktf/provider-google/lib/compute-disk"
import { ComputeInstance } from "@cdktf/provider-google/lib/compute-instance"
import { ComputeAddress } from "@cdktf/provider-google/lib/compute-address"
import { BootStrapInstanceStack } from "../src/bootstrap_cluster/bootstrap_stack"

describe("BootStrapInstanceStack Application", () => {
  let stack: BootStrapInstanceStack
  let app: App
  beforeAll(() => {
    app = Testing.app()
    stack = new BootStrapInstanceStack(app, "test-instance", {
      remote: false,
      credentials: "test_cred.json",
      sshKeyFile: "test_cred.json",
      bucketName: "django",
      bucketPrefix: "chain",
      project: "django",
      zone: "chain-zone",
      region: "chain-region",
      ports: ["89"],
      ipCidrRange: "10.0.1.0/28",
      masterMachineType: "2-2033",
      masterDiskSize: 10,
      image: "bora-bora",
      startupScript: "test_cred.json",
    })
  })
  test("check if it has google provider", () => {
    expect(Testing.synth(stack)).toHaveProvider(GoogleProvider)
  })
  test("check if it has compute network", () => {
    expect(Testing.synth(stack)).toHaveResource(ComputeNetwork)
    expect(Testing.synth(stack)).toHaveResourceWithProperties(ComputeNetwork, {
      name: "test-instance-bootstrap-vpc-network",
    })
    expect(Testing.synth(stack)).toHaveResource(ComputeFirewall)
  })
  test("check if it has compute subnetwork", () => {
    expect(Testing.synth(stack)).toHaveResource(ComputeSubnetwork)
    expect(Testing.synth(stack)).toHaveResourceWithProperties(
      ComputeSubnetwork,
      { name: "test-instance-bootstrap-vpc-subnetwork" },
    )
  })
  test("check if it has compute firewall", () => {
    expect(Testing.synth(stack)).toHaveResource(ComputeFirewall)
    expect(Testing.synth(stack)).toHaveResourceWithProperties(ComputeFirewall, {
      name: "test-instance-bootstrap-vpc-allow-outbound",
      direction: "EGRESS",
      allow: [{ protocol: "all" }],
      log_config: {
        metadata: "INCLUDE_ALL_METADATA",
      },
    })
    expect(Testing.synth(stack)).toHaveResourceWithProperties(ComputeFirewall, {
      name: "test-instance-bootstrap-vpc-allow-inbound-http-ssh",
      direction: "INGRESS",
      source_ranges: ["0.0.0.0/0"],
      allow: [{ protocol: "tcp", ports: ["22", "16443"] }],
      log_config: {
        metadata: "INCLUDE_ALL_METADATA",
      },
    })
  })
  test("check if it has compute disk for master node", () => {
    expect(Testing.synth(stack)).toHaveResource(ComputeDisk)
    expect(Testing.synth(stack)).toHaveResourceWithProperties(ComputeDisk, {
      type: "pd-ssd",
      name: "test-instance-disk-bootstrap",
      image: "bora-bora",
      size: 10,
    })
  })
  test("check if it has compute instance for master node", () => {
    expect(Testing.synth(stack)).toHaveResource(ComputeInstance)
    expect(Testing.synth(stack)).toHaveResourceWithProperties(ComputeInstance, {
      name: "test-instance-vm-bootstrap",
      scheduling: {
        provisioning_model: "STANDARD",
      },
    })
  })
  test("check if it has compute address for master node", () => {
    expect(Testing.synth(stack)).toHaveResourceWithProperties(ComputeAddress, {
      name: "test-instance-vm-bootstrap-static-ip-address",
    })
  })
  test("check if the produced terraform configuration is valid", () => {
    expect(Testing.fullSynth(stack)).toBeValidTerraform()
  })
})
