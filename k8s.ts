import {
  TerraformStack,
  TerraformVariable,
  GcsBackend,
  TerraformOutput,
} from "cdktf"
import { Construct } from "constructs"
import * as fs from "fs"
import { GoogleProvider } from "@cdktf/provider-google/lib/provider"
import { K8Disk } from "./disk"
import { VpcNetwork } from "./vpc"
import { VmInstance } from "./instance"

const times = (n: number, callback: () => void) => {
  if (n <= 0) return
  callback()
  times(n - 1, callback)
}

const numberToText = (num: number): string => {
  const ones = [
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ]
  const tens = [
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ]
  switch (true) {
    case num === 0:
      return "zero"
    case num > 0 && num < 20:
      return ones[num - 1]
    case num > 20 && num < 100:
      return tens[Math.floor(num / 10)].concat(
        num % 10 !== 0 ? "" : ones[(num % 10) - 1],
      )
    default:
      break
  }
  return "none"
}

type K8StackProperties = {
  remote: boolean
  nodes: number
  credentials: string
  bucketName: string
  bucketPrefix: string
}

class K8Stack extends TerraformStack {
  constructor(scope: Construct, id: string, options: K8StackProperties) {
    super(scope, id)
    const variables = this.#define_variables()
    if (options.remote) {
      new GcsBackend(this, {
        bucket: options.bucketName,
        prefix: options.bucketPrefix,
      })
    }
    new GoogleProvider(this, "google", {
      credentials: fs.readFileSync(options.credentials).toString(),
      project: variables.get("projectId").value,
      region: variables.get("region").value,
      zone: variables.get("zone").value,
    })
    const vpcNetwork = new VpcNetwork(this, `${id}-vpc`, {
      ports: variables.get("ports").value,
      ipCidrRange: variables.get("ipCidrRange").value,
    })
    const master = new VmInstance(this, `${id}-vm-master`, {
      machine: variables.get("masterMachineType"),
      disk: new K8Disk(this, `${id}-disk-master`, {
        size: variables.get("masterDiskSize").value,
      }).disk,
      network: vpcNetwork.network,
      subnetwork: vpcNetwork.subnetwork,
    })
    const nodes = [...Array(options.nodes + 1).keys()]
      .filter((num) => num !== 0)
      .map(
        (num) =>
          new VmInstance(this, `${id}-vm-node-${numberToText(num)}`, {
            machine: variables.get("nodeMachineType"),
            network: vpcNetwork.network,
            subnetwork: vpcNetwork.subnetwork,
            disk: new K8Disk(this, `${id}-disk-node-${numberToText(num)}`, {
              size: variables.get("nodeDiskSize").value,
            }).disk,
          }),
      )
    new TerraformOutput(this, "master-node", {
      value: master.vmInstance,
      sensitive: true,
    })
    nodes.forEach((n, idx) => {
      new TerraformOutput(this, `workder-node-${numberToText(idx + 1)}`, {
        value: n.vmInstance,
        sensitive: true,
      })
    })
  }

  #define_variables() {
    const variables = new Map()
    variables
      .set(
        "projectId",
        new TerraformVariable(this, "project_id", {
          description: "gcp project id",
          type: "string",
          nullable: false,
        }),
      )
      .set(
        "ports",
        new TerraformVariable(this, "ports", {
          description: "ports that will be opened in the network",
          type: "list(string)",
          default: ["8955"],
        }),
      )
      .set(
        "region",
        new TerraformVariable(this, "region", {
          default: "us-central1",
          description: "gcp region",
        }),
      )
      .set(
        "zone",
        new TerraformVariable(this, "zone", {
          default: "us-central1-c",
          description: "gcp zone name within a region",
        }),
      )
      .set(
        "ipCidrRange",
        new TerraformVariable(this, "ip-cidr-range", {
          default: "10.8.0.0/21",
          description:
            "The IP range in cidr notation for vpc subnet that will be assigned to nodes",
        }),
      )
      .set(
        "masterInstanceName",
        new TerraformVariable(this, "master_instance", {
          type: "string",
          default: "k8-master",
          description:
            "name of the instance that will be used for kubernetes controller",
        }),
      )
      .set(
        "masterMachineType",
        new TerraformVariable(this, "master-machine-type", {
          type: "string",
          default: "custom-2-2048",
          description: "The machine type for kubernetes controller",
        }),
      )
      .set(
        "masterDiskSize",
        new TerraformVariable(this, "master-disk-size", {
          type: "number",
          default: 30,
          description: "size of the boot disk of kubernetes master in GB",
        }),
      )
      .set(
        "nodeInstanceName",
        new TerraformVariable(this, "node_instance", {
          type: "string",
          default: "k8-node",
          description:
            "name of the instance that will be used for kubernetes nodes",
        }),
      )
      .set(
        "nodeMachineType",
        new TerraformVariable(this, "node-machine-type", {
          type: "string",
          default: "custom-2-4048",
          description: "The machine type for kubernetes node",
        }),
      )
      .set(
        "nodeDiskSize",
        new TerraformVariable(this, "node-disk-size", {
          type: "number",
          default: 50,
          description: "size of the boot disk of kubernetes nodes in GB",
        }),
      )
    return variables
  }
}

export { K8Stack }
