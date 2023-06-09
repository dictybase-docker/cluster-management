import { Construct } from "constructs"
import { ComputeNetwork } from "@cdktf/provider-google/lib/compute-network"
import { ComputeSubnetwork } from "@cdktf/provider-google/lib/compute-subnetwork"
import { ComputeFirewall } from "@cdktf/provider-google/lib/compute-firewall"

type VpcNetworkOptions = {
  ipCidrRange: string
  ports: Array<string>
}

class BootstrapVpcNetwork extends Construct {
  public readonly network: ComputeNetwork
  public readonly subnetwork: ComputeSubnetwork
  public readonly outboundFirewall: ComputeFirewall
  public readonly inboundSshFirewall: ComputeFirewall
  constructor(scope: Construct, id: string, option: VpcNetworkOptions) {
    super(scope, id)
    this.network = new ComputeNetwork(this, `${id}-network`, {
      autoCreateSubnetworks: false,
      name: `${id}-network`,
    })
    this.subnetwork = new ComputeSubnetwork(this, `${id}-subnetwork`, {
      name: `${id}-subnetwork`,
      ipCidrRange: option.ipCidrRange,
      network: this.network.id,
    })
    this.outboundFirewall = new ComputeFirewall(this, `${id}-allow-outbound`, {
      name: `${id}-allow-outbound`,
      network: this.network.id,
      allow: [{ protocol: "all" }],
      direction: "EGRESS",
      logConfig: {
        metadata: "INCLUDE_ALL_METADATA",
      },
    })
    this.inboundSshFirewall = new ComputeFirewall(
      this,
      `${id}-allow-inbound-http-ssh`,
      {
        name: `${id}-allow-inbound-http-ssh`,
        network: this.network.id,
        sourceRanges: ["0.0.0.0/0"],
        allow: [{ protocol: "tcp", ports: ["22", "16443"] }],
        direction: "INGRESS",
        logConfig: {
          metadata: "INCLUDE_ALL_METADATA",
        },
      },
    )
  }
}

export { BootstrapVpcNetwork }
