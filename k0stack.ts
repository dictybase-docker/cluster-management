import { TerraformStack, TerraformVariable, TerraformOutput } from "cdktf"
import { Construct } from "constructs"
import { ComputeInstance } from "@cdktf/provider-google/lib/compute-instance"
import { numberToText } from "./stack_utils"

type K0StackProperties = {
  master: ComputeInstance
  workers: Array<ComputeInstance>
}

class K0Stack extends TerraformStack {
  constructor(scope: Construct, id: string, options: K0StackProperties) {
    super(scope, id)
    const { master, workers } = options
    this.#define_variables()
    new TerraformOutput(this, "master-node-ip", {
      value: master.networkInterface.get(0).accessConfig.get(0).natIp,
    })
    workers.forEach((w, idx) => {
      new TerraformOutput(this, `workder-node-${numberToText(idx + 1)}-ip`, {
        value: w.networkInterface.get(0).accessConfig.get(0).natIp,
      })
    })
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
