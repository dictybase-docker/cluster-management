import "cdktf/lib/testing/adapters/jest" // Load types for expect matchers
import { Testing, App } from "cdktf"
import { GoogleProvider } from "@cdktf/provider-google/lib/provider"
import { ComputeNetwork } from "@cdktf/provider-google/lib/compute-network"
import { ComputeSubnetwork } from "@cdktf/provider-google/lib/compute-subnetwork"
import { ComputeFirewall } from "@cdktf/provider-google/lib/compute-firewall"
import { ComputeDisk } from "@cdktf/provider-google/lib/compute-disk"
import { ComputeInstance } from "@cdktf/provider-google/lib/compute-instance"
import { ComputeAddress } from "@cdktf/provider-google/lib/compute-address"
import { K0Stack } from "../src/k0s_cluster/k0stack"

describe("VmInstanceStack Application", () => {
  let stack: K0Stack
  let app: App
  beforeAll(() => {
    app = Testing.app()
    stack = new K0Stack(app, "test-instance", {
      remote: false,
      nodes: 3,
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
      nodeMachineType: "4-4011",
      nodeDiskSize: 20,
    })
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
      name: "test-instance-vpc-allow-outbound",
      direction: "EGRESS",
      allow: [{ protocol: "all" }],
      log_config: {
        metadata: "INCLUDE_ALL_METADATA",
      },
    })
    expect(Testing.synth(stack)).toHaveResourceWithProperties(ComputeFirewall, {
      name: "test-instance-vpc-allow-inbound-http-ssh",
      direction: "INGRESS",
      source_ranges: ["0.0.0.0/0"],
      allow: [{ protocol: "tcp", ports: ["80", "443", "22", "6443"] }],
      log_config: {
        metadata: "INCLUDE_ALL_METADATA",
      },
    })
    expect(Testing.synth(stack)).toHaveResourceWithProperties(ComputeFirewall, {
      name: "test-instance-vpc-allow-inbound-k8s",
      direction: "INGRESS",
      source_ranges: ["10.0.1.0/28"],
      allow: [
        {
          protocol: "tcp",
          ports: [
            "2379",
            "2380",
            "6443",
            "179",
            "10250",
            "10257",
            "10259",
            "9443",
            "8132",
            "30000-32767",
          ],
        },
      ],
      log_config: {
        metadata: "INCLUDE_ALL_METADATA",
      },
    })
  })
  test("check if it has compute disk for master node", () => {
    expect(Testing.synth(stack)).toHaveResource(ComputeDisk)
    expect(Testing.synth(stack)).toHaveResourceWithProperties(ComputeDisk, {
      type: "pd-ssd",
      name: "test-instance-disk-master",
      image: "rocky-linux-8-optimized-gcp-v20230306",
      size: 10,
    })
  })
  test("check if it has compute instance for master node", () => {
    expect(Testing.synth(stack)).toHaveResource(ComputeInstance)
    expect(Testing.synth(stack)).toHaveResourceWithProperties(ComputeInstance, {
      name: "test-instance-vm-master",
      scheduling: {
        provisioning_model: "STANDARD",
      },
    })
  })
  test.each(["one", "two", "three"])(
    "check if it has computer instance for worker node %s",
    (node) => {
      expect(Testing.synth(stack)).toHaveResourceWithProperties(
        ComputeInstance,
        {
          name: `test-instance-vm-node-${node}`,
          scheduling: {
            provisioning_model: "STANDARD",
          },
        },
      )
    },
  )
  test.each(["one", "two", "three"])(
    "check if it has computer disk for worker node %s",
    (node) => {
      expect(Testing.synth(stack)).toHaveResourceWithProperties(ComputeDisk, {
        type: "pd-ssd",
        name: `test-instance-disk-node-${node}`,
        image: "rocky-linux-8-optimized-gcp-v20230306",
        size: 20,
      })
    },
  )
  test.each(["one", "two", "three"])(
    "check if it has compute address for worker node %s",
    (node) => {
      expect(Testing.synth(stack)).toHaveResourceWithProperties(
        ComputeAddress,
        {
          name: `test-instance-vm-node-${node}-static-ip-address`,
        },
      )
    },
  )
  test("check if it has compute address for master node", () => {
    expect(Testing.synth(stack)).toHaveResourceWithProperties(ComputeAddress, {
      name: "test-instance-vm-master-static-ip-address",
    })
  })
  test("check if the produced terraform configuration is valid", () => {
    expect(Testing.fullSynth(stack)).toBeValidTerraform()
  })
})
