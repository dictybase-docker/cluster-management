import { Construct } from "constructs"
import { TerraformVariable } from "cdktf"
import { ComputeDisk } from "@cdktf/provider-google/lib/compute-disk"
import { ComputeNetwork } from "@cdktf/provider-google/lib/compute-network"
import { ComputeSubnetwork } from "@cdktf/provider-google/lib/compute-subnetwork"
import { ComputeInstance } from "@cdktf/provider-google/lib/compute-instance"

type VmInstanceProperties = {
  machine: TerraformVariable
  disk: ComputeDisk
  network: ComputeNetwork
  subnetwork: ComputeSubnetwork
}

class VmInstance extends Construct {
  public readonly vmInstance: ComputeInstance
  constructor(scope: Construct, id: string, properties: VmInstanceProperties) {
    super(scope, id)
    const { machine, disk, network, subnetwork } = properties
    this.vmInstance = new ComputeInstance(this, id, {
      name: id,
      machineType: machine.value,
      bootDisk: {
        source: disk.id,
      },
      networkInterface: [{ network: network.id, subnetwork: subnetwork.id }],
      allowStoppingForUpdate: true,
      scheduling: {
        provisioningModel: "STANDARD",
      },
    })
  }
}

export { VmInstance }
