import { TerraformStack, TerraformOutput } from "cdktf"
import { Construct } from "constructs"
import { ComputeInstance } from "@cdktf/provider-google/lib/compute-instance"
import { numberToText } from "./stack_utils"

type K0StackProperties = {
  master: ComputeInstance
  workers: Array<ComputeInstance>
  sshKeyFile: string
}

class K0Stack extends TerraformStack {
  constructor(scope: Construct, id: string, options: K0StackProperties) {
    super(scope, id)
    const { master, workers } = options
    new TerraformOutput(this, "master-node-ip", {
      value: master.networkInterface.get(0).accessConfig.get(0).natIp,
    })
    workers.forEach((w, idx) => {
      new TerraformOutput(this, `workder-node-${numberToText(idx + 1)}-ip`, {
        value: w.networkInterface.get(0).accessConfig.get(0).natIp,
      })
    })
  }
}

export { K0Stack }
