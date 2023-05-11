import { TerraformStack, TerraformOutput } from "cdktf"
import { Construct } from "constructs"
import { ComputeInstance } from "@cdktf/provider-google/lib/compute-instance"

type K0StackProperties = {
  master: ComputeInstance
  workers: Array<ComputeInstance>
}

class K0Stack extends TerraformStack {
  constructor(scope: Construct, id: string, options: K0StackProperties) {
    super(scope, id)
    const { master, workers } = options
    new TerraformOutput(this, "master", {
      value: master.networkInterface.get(0).accessConfig.get(0).natIp,
    })
    new TerraformOutput(this, "workers", {
      value: workers.map(
        (w) => w.networkInterface.get(0).accessConfig.get(0).natIp,
      ),
    })
  }
}

export { K0Stack }
