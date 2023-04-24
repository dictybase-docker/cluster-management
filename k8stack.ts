import { TerraformStack, GcsBackend } from "cdktf"
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
  ports: Array<string>
  ipCidrRange: string
  masterMachineType: string
  masterDiskSize: number
  nodeMachineType: string
  nodeDiskSize: number
}

class K8Stack extends TerraformStack {
  public readonly master: ComputeInstance
  public readonly workers: Array<ComputeInstance>
  constructor(scope: Construct, id: string, options: K8StackProperties) {
    super(scope, id)
    const {
      remote,
      nodes,
      credentials,
      bucketName,
      bucketPrefix,
      project,
      region,
      zone,
      ports,
      ipCidrRange,
      masterMachineType,
      masterDiskSize,
      nodeMachineType,
      nodeDiskSize,
      sshKeyFile,
    } = options
    if (remote) {
      new GcsBackend(this, {
        bucket: bucketName,
        prefix: bucketPrefix,
        credentials: fs.readFileSync(credentials).toString(),
      })
    }
    new GoogleProvider(this, "google", {
      credentials: fs.readFileSync(credentials).toString(),
      project: project,
      region: region,
      zone: zone,
    })
    const vpcNetwork = new VpcNetwork(this, `${id}-vpc`, {
      ports: ports,
      ipCidrRange: ipCidrRange,
    })
    const sshKey = this.#read_key_file(sshKeyFile)
    this.master = new VmInstance(this, `${id}-vm-master`, {
      machine: masterMachineType,
      disk: new K8Disk(this, `${id}-disk-master`, {
        size: masterDiskSize,
      }).disk,
      network: vpcNetwork.network,
      subnetwork: vpcNetwork.subnetwork,
      sshKey: sshKey,
    }).vmInstance
    this.workers = [...Array(nodes + 1).keys()]
      .filter((num) => num !== 0)
      .map(
        (num) =>
          new VmInstance(this, `${id}-vm-node-${numberToText(num)}`, {
            machine: nodeMachineType,
            network: vpcNetwork.network,
            subnetwork: vpcNetwork.subnetwork,
            sshKey: sshKey,
            disk: new K8Disk(this, `${id}-disk-node-${numberToText(num)}`, {
              size: nodeDiskSize,
            }).disk,
          }),
      )
      .map((w) => w.vmInstance)
  }

  #read_key_file(file: string) {
    const content = fs.readFileSync(file).toString().trimEnd()
    const user = content.split(" ").at(-1) as string
    return user.concat(":").concat(content)
  }
}

export { K8Stack }
