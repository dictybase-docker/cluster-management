import * as cdktf from "cdktf"
import { Construct } from "constructs"
import { TerraformStack, TerraformOutput } from "cdktf"
import * as path from "path"
import * as fs from "fs"
import { GoogleProvider } from "@cdktf/provider-google/lib/provider"
import VpcNetwork from "./vpc"
import { K8Disk } from "./disk"
import { ComputeInstance } from "@cdktf/provider-google/lib/compute-instance"

class VmInstanceStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id)
    const projectId = new cdktf.TerraformVariable(this, "project_id", {
      description: "gcp project id",
      type: "string",
      nullable: false,
    })
    const ports = new cdktf.TerraformVariable(this, "ports", {
      description: "ports that will be opened in the network",
      type: "list(string)",
      default: ["8955"],
    })
    const region = new cdktf.TerraformVariable(this, "region", {
      default: "us-central1",
      description: "gcp region",
    })
    const zone = new cdktf.TerraformVariable(this, "zone", {
      default: "us-central1-c",
      description: "gcp zone name within a region",
    })
    const ipCidrRange = new cdktf.TerraformVariable(this, "ip-cidr-range", {
      default: "10.8.0.0/21",
      description:
        "The IP range in cidr notation for vpc subnet that will be assigned to nodes",
    })
    const instanceName = new cdktf.TerraformVariable(this, "instance", {
      type: "string",
      default: "k8-master",
      description: "name of the instance",
    })
    const machineType = new cdktf.TerraformVariable(this, "machine-tyoe", {
      type: "string",
      default: "custom-2-2048",
      description: "The machine type to create",
    })
    const bootDiskSize = new cdktf.TerraformVariable(this, "disk-size", {
      type: "number",
      default: 30,
      description: "size of the boot disk in GB",
    })
    new GoogleProvider(this, "google", {
      credentials: this._read_credentials("credentials.json"),
      project: projectId.value,
      region: region.value,
      zone: zone.value,
    })
    const vpcNetwork = new VpcNetwork(this, id, {
      ports: ports.value,
      ipCidrRange: ipCidrRange.value,
    })
    const k8Disk = new K8Disk(this, id, { size: bootDiskSize.value })
    const instance = new ComputeInstance(this, "instance", {
      name: instanceName.value,
      machineType: machineType.value,
      bootDisk: {
        source: k8Disk.disk.id,
      },
      networkInterface: [{ network: vpcNetwork.network.id }],
      allowStoppingForUpdate: true,
      scheduling: {
        provisioningModel: "STANDARD",
      },
    })
    new TerraformOutput(this, "ip-addr", {
      value: instance.networkInterface.get(0).accessConfig.get(0).natIp,
    })
  }

  _read_credentials(name: string) {
    let cred_path: string = ""
    const default_path = path.join(process.cwd(), name)
    if (fs.existsSync(default_path)) {
      cred_path = default_path
    } else {
      const path_from_env = process.env["TF_VAR_service_account_file"]
      if (path_from_env) {
        cred_path = path.join(process.cwd(), path_from_env)
      }
    }
    return fs.readFileSync(cred_path).toString()
  }
}

export default VmInstanceStack
