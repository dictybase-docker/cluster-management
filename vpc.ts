import { Construct } from "constructs"
import { ComputeNetwork } from "@cdktf/provider-google/lib/compute-network"
import { ComputeSubnetwork } from "@cdktf/provider-google/lib/compute-subnetwork"
import { ComputeFirewall } from "@cdktf/provider-google/lib/compute-firewall"

type VpcNetworkOptions = {
  name: string
  ipCidrRange: string
  ports: Array<string>
}

class VpcNetwork extends Construct {
  public readonly network: ComputeNetwork
  public readonly subnetwork: ComputeSubnetwork
  public readonly firewall: ComputeFirewall
  constructor(scope: Construct, name: string, option: VpcNetworkOptions) {
    super(scope, name)
    this.network = new ComputeNetwork(this, "vpc-network", {
      autoCreateSubnetworks: false,
      name: `${option.name}-vpc-network`,
    })
    this.subnetwork = new ComputeSubnetwork(this, "vpc-subnetwork", {
      name: `${option.name}-vpc-subnetwork`,
      ipCidrRange: option.ipCidrRange,
      network: this.network.id,
    })
    this.firewall = new ComputeFirewall(this, "allow-ssh", {
      name: `${option.name}-allow-ssh`,
      network: this.network.id,
      allow: [{ protocol: "tcp", ports: option.ports }],
    })
  }
}

export default VpcNetwork
