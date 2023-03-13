import { Construct } from "constructs"
import { ComputeNetwork } from "@cdktf/provider-google/lib/compute-network"
import { ComputeSubnetwork } from "@cdktf/provider-google/lib/compute-subnetwork"
import { ComputeFirewall } from "@cdktf/provider-google/lib/compute-firewall"

type VpcNetworkOptions = {
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
      name: `${name}-vpc-network`,
    })
    this.subnetwork = new ComputeSubnetwork(this, "vpc-subnetwork", {
      name: `${name}-vpc-subnetwork`,
      ipCidrRange: option.ipCidrRange,
      network: this.network.id,
    })
    this.firewall = new ComputeFirewall(this, "allow-ssh", {
      name: `${name}-allow-ssh`,
      network: this.network.id,
      sourceRanges: ["0.0.0.0/0"],
      allow: [{ protocol: "tcp", ports: option.ports }],
    })
  }
}

export default VpcNetwork
