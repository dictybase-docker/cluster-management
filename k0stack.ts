import {
  TerraformStack,
  GcsBackend,
  TerraformVariable,
  DataTerraformRemoteStateGcs,
} from "cdktf"
import * as fs from "fs"
import { Construct } from "constructs"

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
    new TerraformVariable(this, "project_id", {
      description: "gcp project id",
      type: "string",
      nullable: false,
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
}

export { K0Stack }
