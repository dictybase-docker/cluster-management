import { Construct } from "constructs"
import { TerraformVariable } from "cdktf"
import { ComputeDisk } from "@cdktf/provider-google/lib/compute-disk"
import { ComputeNetwork } from "@cdktf/provider-google/lib/compute-network"
import { ComputeInstance } from "@cdktf/provider-google/lib/compute-instance"

type VmInstanceProperties = {
  name: TerraformVariable
  machine: TerraformVariable
  disk: ComputeDisk
  network: ComputeNetwork
}

class VmInstance extends Construct {
  public readonly vmInstance: ComputeInstance
  constructor(scope: Construct, id: string, properties: VmInstanceProperties) {
    super(scope, `${id}-vminstance`)
    const { name, machine, disk, network } = properties
    this.vmInstance = new ComputeInstance(this, "instance", {
      name: name.value,
      machineType: machine.value,
      bootDisk: {
        source: disk.id,
      },
      networkInterface: [{ network: network.id }],
      allowStoppingForUpdate: true,
      scheduling: {
        provisioningModel: "STANDARD",
      },
    })
  }
}

export { VmInstance }
