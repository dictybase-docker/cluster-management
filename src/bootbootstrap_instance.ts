import { TerraformStack, GcsBackend } from "cdktf"
import { Construct } from "constructs"
import * as fs from "fs"
import { GoogleProvider } from "@cdktf/provider-google/lib/provider"
import { K8Disk } from "./disk"
import { VpcNetwork } from "./vpc"
import { VmInstance } from "./instance"
import { ComputeInstance } from "@cdktf/provider-google/lib/compute-instance"

type BootStrapInstanceStackProperties = {
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
  image: string
}

class BootStrapInstanceStack extends TerraformStack {
  public readonly master: ComputeInstance
  constructor(
    scope: Construct,
    id: string,
    options: BootStrapInstanceStackProperties,
  ) {
    super(scope, id)
    const {
      remote,
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
      sshKeyFile,
      image,
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
    this.master = new VmInstance(this, `${id}-vm-bootstrap`, {
      machine: masterMachineType,
      disk: new K8Disk(this, `${id}-disk-bootstrap`, {
        size: masterDiskSize,
        image: image,
      }).disk,
      network: vpcNetwork.network,
      subnetwork: vpcNetwork.subnetwork,
      sshKey: sshKey,
    }).vmInstance
  }

  #read_key_file(file: string) {
    const content = fs.readFileSync(file).toString().trimEnd()
    const user = content.split(" ").at(-1) as string
    return user.concat(":").concat(content)
  }
}

export { BootStrapInstanceStack }
