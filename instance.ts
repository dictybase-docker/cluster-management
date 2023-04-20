import { Construct } from "constructs"
import { TerraformVariable } from "cdktf"
import { ComputeDisk } from "@cdktf/provider-google/lib/compute-disk"
import { ComputeNetwork } from "@cdktf/provider-google/lib/compute-network"
import { ComputeSubnetwork } from "@cdktf/provider-google/lib/compute-subnetwork"
import { ComputeInstance } from "@cdktf/provider-google/lib/compute-instance"
import { ComputeAddress } from "@cdktf/provider-google/lib/compute-address"

type VmInstanceProperties = {
  machine: TerraformVariable
  disk: ComputeDisk
  network: ComputeNetwork
  subnetwork: ComputeSubnetwork
  sshKey: string
}

class VmInstance extends Construct {
  public readonly vmInstance: ComputeInstance
  public readonly staticIPaddress: ComputeAddress
  constructor(scope: Construct, id: string, properties: VmInstanceProperties) {
    super(scope, id)
    const { machine, disk, network, subnetwork, sshKey } = properties
    this.staticIPaddress = new ComputeAddress(this, `${id}-static-ip-address`, {
      name: `${id}-static-ip-address`,
    })
    this.vmInstance = new ComputeInstance(this, id, {
      name: id,
      machineType: machine.value,
      bootDisk: {
        source: disk.id,
      },
      networkInterface: [
        {
          network: network.id,
          subnetwork: subnetwork.id,
          accessConfig: [{ natIp: this.staticIPaddress.address }],
        },
      ],
      allowStoppingForUpdate: true,
      scheduling: {
        provisioningModel: "STANDARD",
      },
      metadata: {
        "ssh-keys": sshKey,
      },
    })
  }
}

export { VmInstance }
