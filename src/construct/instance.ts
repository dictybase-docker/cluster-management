import { Construct } from "constructs"
import { ComputeDisk } from "@cdktf/provider-google/lib/compute-disk"
import { ComputeNetwork } from "@cdktf/provider-google/lib/compute-network"
import { ComputeSubnetwork } from "@cdktf/provider-google/lib/compute-subnetwork"
import { ComputeInstance } from "@cdktf/provider-google/lib/compute-instance"
import { ComputeAddress } from "@cdktf/provider-google/lib/compute-address"

type VmInstanceProperties = {
  machine: string
  disk: ComputeDisk
  network: ComputeNetwork
  subnetwork: ComputeSubnetwork
  sshKey: string
  startupScript?: string
}

class VmInstance extends Construct {
  public readonly vmInstance: ComputeInstance
  public readonly staticIPaddress: ComputeAddress
  constructor(scope: Construct, id: string, properties: VmInstanceProperties) {
    super(scope, id)
    const { machine, disk, network, subnetwork, sshKey, startupScript } =
      properties
    this.staticIPaddress = new ComputeAddress(this, `${id}-static-ip-address`, {
      name: `${id}-static-ip-address`,
    })
    this.vmInstance = new ComputeInstance(this, id, {
      name: id,
      machineType: machine,
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
        "enable-os-config": "TRUE",
        "startup-script":
          "snap install microk8s --classic --channel=1.26/stable",
      },
    })
  }
}

export { VmInstance }
