import { TerraformStack, TerraformOutput } from "cdktf"
import { Construct } from "constructs"
import { ComputeInstance } from "@cdktf/provider-google/lib/compute-instance"
import { numberToText } from "./stack_utils"
import { HostNodeProperties } from "./k0s_cluster"
import { createClusterYml } from "./k0s_cluster"
import { writeFileSync } from "fs"

type K0StackProperties = {
  master: ComputeInstance
  workers: Array<ComputeInstance>
  sshKeyFile: string
  version: string
  user: string
  output: string
}

class K0Stack extends TerraformStack {
  constructor(scope: Construct, id: string, options: K0StackProperties) {
    super(scope, id)
    const { master, workers, sshKeyFile, version, user, output } = options
    const hosts: Array<HostNodeProperties> = [
      {
        user: user,
        keyPath: sshKeyFile,
        role: "controller",
        address: master.networkInterface.get(0).accessConfig.get(0).natIp,
      },
    ]
    new TerraformOutput(this, "master-node-ip", {
      value: master.networkInterface.get(0).accessConfig.get(0).natIp,
    })
    workers.forEach((w, idx) => {
      new TerraformOutput(this, `workder-node-${numberToText(idx + 1)}-ip`, {
        value: w.networkInterface.get(0).accessConfig.get(0).natIp,
      })
      hosts.push({
        user: user,
        keyPath: sshKeyFile,
        role: "worker",
        address: w.networkInterface.get(0).accessConfig.get(0).natIp,
      })
    })
    const clusterYml = createClusterYml({
      version: version,
      hosts,
    })
    writeFileSync(output, clusterYml)
  }
}

export { K0Stack }
