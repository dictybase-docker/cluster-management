import { TerraformStack, TerraformVariable, GcsBackend } from "cdktf"
import { Construct } from "constructs"
import * as path from "path"
import * as fs from "fs"
import { GoogleProvider } from "@cdktf/provider-google/lib/provider"
import { K8Disk } from "./disk"
import { VpcNetwork } from "./vpc"
import { VmInstance } from "./instance"

const times = (n: number, callback: () => void) => {
  if (n <= 0) return
  callback()
  times(n - 1, callback)
}

class K8Stack extends TerraformStack {
  constructor(scope: Construct, id: string, is_remote?: boolean) {
    super(scope, id)
    const variables = this.#define_variables()
    new GoogleProvider(this, "google", {
      credentials: this.#read_credentials("credentials.json"),
      project: variables.get("projectId").value,
      region: variables.get("region").value,
      zone: variables.get("zone").value,
    })
    if (is_remote) {
      new GcsBackend(this, {
        bucket: variables.get("bucketName").value,
        prefix: variables.get("bucketPrefix").value,
      })
    }
    const vpcNetwork = new VpcNetwork(this, id, {
      ports: variables.get("ports").value,
      ipCidrRange: variables.get("ipCidrRange").value,
    })
    new VmInstance(this, id, {
      name: variables.get("masterInstanceName"),
      machine: variables.get("masterMachineType"),
      disk: new K8Disk(this, id, {
        size: variables.get("masterDiskSize").value,
      }).disk,
      network: vpcNetwork.network,
    })
  }

  #read_credentials(name: string) {
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

  #define_variables() {
    const variables = new Map()
    variables
      .set(
        "projectId",
        new TerraformVariable(this, "project_id", {
          description: "gcp project id",
          type: "string",
          nullable: false,
        }),
      )
      .set(
        "ports",
        new TerraformVariable(this, "ports", {
          description: "ports that will be opened in the network",
          type: "list(string)",
          default: ["8955"],
        }),
      )
      .set(
        "region",
        new TerraformVariable(this, "region", {
          default: "us-central1",
          description: "gcp region",
        }),
      )
      .set(
        "zone",
        new TerraformVariable(this, "zone", {
          default: "us-central1-c",
          description: "gcp zone name within a region",
        }),
      )
      .set(
        "ipCidrRange",
        new TerraformVariable(this, "ip-cidr-range", {
          default: "10.8.0.0/21",
          description:
            "The IP range in cidr notation for vpc subnet that will be assigned to nodes",
        }),
      )
      .set(
        "masterInstanceName",
        new TerraformVariable(this, "master_instance", {
          type: "string",
          default: "k8-master",
          description:
            "name of the instance that will be used for kubernetes controller",
        }),
      )
      .set(
        "masterMachineType",
        new TerraformVariable(this, "master-machine-type", {
          type: "string",
          default: "custom-2-2048",
          description: "The machine type for kubernetes controller",
        }),
      )
      .set(
        "masterDiskSize",
        new TerraformVariable(this, "master-disk-size", {
          type: "number",
          default: 30,
          description: "size of the boot disk of kubernetes master in GB",
        }),
      )
      .set(
        "nodeInstanceName",
        new TerraformVariable(this, "node_instance", {
          type: "string",
          default: "k8-node",
          description:
            "name of the instance that will be used for kubernetes nodes",
        }),
      )
      .set(
        "nodeMachineType",
        new TerraformVariable(this, "node-machine-type", {
          type: "string",
          default: "custom-2-4048",
          description: "The machine type for kubernetes node",
        }),
      )
      .set(
        "nodeDiskSize",
        new TerraformVariable(this, "node-disk-size", {
          type: "number",
          default: 50,
          description: "size of the boot disk of kubernetes nodes in GB",
        }),
      )
      .set(
        "bucketName",
        new TerraformVariable(this, "bucket_name", {
          description: `GCS bucket name where terraform remote state is stored.`,
          type: "string",
          default: "dicty-terraform-state",
        }),
      )
      .set(
        "bucketPrefix",
        new TerraformVariable(this, "bucket_prefix", {
          description: `GCS bucket folder prefix where terraform remote state is stored.`,
          type: "string",
          default: "k0s-cluster-cdktf",
        }),
      )
    return variables
  }
}

export { K8Stack }
