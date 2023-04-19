import {
  TerraformStack,
  GcsBackend,
  TerraformVariable,
  DataTerraformRemoteStateGcs,
} from "cdktf"
import * as fs from "fs"
import { Construct } from "constructs"
import { GoogleProvider } from "@cdktf/provider-google/lib/provider"

type K0StackProperties = {
  remote: boolean
  nodes: number
  credentials: string
  bucketName: string
  bucketPrefix: string
}

class K0Stack extends TerraformStack {
  constructor(scope: Construct, id: string, options: K0StackProperties) {
    super(scope, id)
    const variables = this.#define_variables()
    new GoogleProvider(this, "google", {
      credentials: fs.readFileSync(options.credentials).toString(),
      project: variables.get("projectId").value,
      region: variables.get("region").value,
      zone: variables.get("zone").value,
    })
    if (options.remote) {
      new GcsBackend(this, {
        bucket: options.bucketName,
        prefix: options.bucketPrefix,
        credentials: fs.readFileSync(options.credentials).toString(),
      })
      const state = new DataTerraformRemoteStateGcs(this, "gcs", {
        bucket: options.bucketName,
        prefix: options.bucketPrefix,
      })
      console.log(state.getString("master-node-ip"))
    }
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
    return variables
  }
}

export { K0Stack }
