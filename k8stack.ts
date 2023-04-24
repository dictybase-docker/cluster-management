import { TerraformStack, TerraformVariable, GcsBackend } from "cdktf"
import { Construct } from "constructs"
import * as fs from "fs"
import { GoogleProvider } from "@cdktf/provider-google/lib/provider"
import { K8Disk } from "./disk"
import { VpcNetwork } from "./vpc"
import { VmInstance } from "./instance"
import { ComputeInstance } from "@cdktf/provider-google/lib/compute-instance"
import { numberToText } from "./stack_utils"

type K8StackProperties = {
  remote: boolean
  nodes: number
  credentials: string
  bucketName: string
  bucketPrefix: string
  sshKeyFile: string
  project: string
  region: string
  zone: string
}

class K8Stack extends TerraformStack {
  public readonly master: ComputeInstance
  public readonly workers: Array<ComputeInstance>
  constructor(scope: Construct, id: string, options: K8StackProperties) {
    super(scope, id)
    const { project, region, zone } = options
    const variables = this.#define_variables()
    if (options.remote) {
      new GcsBackend(this, {
        bucket: options.bucketName,
        prefix: options.bucketPrefix,
        credentials: fs.readFileSync(options.credentials).toString(),
      })
    }
    new GoogleProvider(this, "google", {
      credentials: fs.readFileSync(options.credentials).toString(),
      project: project,
      region: region,
      zone: zone,
    })
    const vpcNetwork = new VpcNetwork(this, `${id}-vpc`, {
      ports: variables.get("ports").value,
      ipCidrRange: variables.get("ipCidrRange").value,
    })
    const sshKey = this.#read_key_file(options.sshKeyFile)
    this.master = new VmInstance(this, `${id}-vm-master`, {
      machine: variables.get("masterMachineType"),
      disk: new K8Disk(this, `${id}-disk-master`, {
        size: variables.get("masterDiskSize").value,
      }).disk,
      network: vpcNetwork.network,
      subnetwork: vpcNetwork.subnetwork,
      sshKey: sshKey,
    }).vmInstance
    this.workers = [...Array(options.nodes + 1).keys()]
      .filter((num) => num !== 0)
      .map(
        (num) =>
          new VmInstance(this, `${id}-vm-node-${numberToText(num)}`, {
            machine: variables.get("nodeMachineType"),
            network: vpcNetwork.network,
            subnetwork: vpcNetwork.subnetwork,
            sshKey: sshKey,
            disk: new K8Disk(this, `${id}-disk-node-${numberToText(num)}`, {
              size: variables.get("nodeDiskSize").value,
            }).disk,
          }),
      )
      .map((w) => w.vmInstance)
  }

  #define_variables() {
    const variables = new Map()
    variables
      .set(
        "ports",
        new TerraformVariable(this, "ports", {
          description: "ports that will be opened in the network",
          type: "list(string)",
          default: ["8955"],
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
          default: "custom-2-4096",
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

  #read_key_file(file: string) {
    const content = fs.readFileSync(file).toString().trimEnd()
    const user = content.split(" ").at(-1) as string
    return user.concat(":").concat(content)
  }
}

export { K8Stack }
