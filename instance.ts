import * as cdktf from "cdktf"
import { Construct } from "constructs"
import { TerraformStack } from "cdktf"
import * as path from "path"
import * as fs from "fs"
import { GoogleProvider } from "@cdktf/provider-google/lib/provider"
import VpcNetwork from "./vpc"

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
    new GoogleProvider(this, "google", {
      credentials: this._read_credentials("credentials.json"),
      project: projectId.value,
      region: region.value,
      zone: zone.value,
    })
    new VpcNetwork(this, id, {
      ports: ports.value,
      ipCidrRange: ipCidrRange.value,
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
