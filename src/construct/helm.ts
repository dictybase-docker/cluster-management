import { TerraformStack, GcsBackend } from "cdktf"
import { Construct } from "constructs"
import { HelmProvider } from "@cdktf/provider-helm/lib/provider"
import {
  Release,
  ReleaseSet,
  ReleaseSetListStruct,
} from "@cdktf/provider-helm/lib/release"
import { readFileSync } from "fs"

type HelmChartProperties = {
  config: string
  version: string
  remote: boolean
  credentials: string
  bucketName: string
  bucketPrefix: string
  namespace: string
  location?: string
  repo?: string
  name: string
  values?: Array<ReleaseSet>
  listValues?: Array<ReleaseSetListStruct>
}

class HelmChartStack extends TerraformStack {
  constructor(scope: Construct, id: string, options: HelmChartProperties) {
    const {
      version,
      remote,
      namespace,
      credentials,
      bucketName,
      bucketPrefix,
      config,
      repo,
      location,
      name,
      values,
      listValues,
    } = options
    super(scope, id)
    if (remote) {
      new GcsBackend(this, {
        bucket: bucketName,
        prefix: bucketPrefix,
        credentials: readFileSync(credentials).toString(),
      })
    }
    new HelmProvider(this, "helm", {
      kubernetes: {
        configPath: config,
      },
    })
    let releaseConfig = {
      name: name,
      createNamespace: true,
      namespace,
      version,
      set: values,
      setList: listValues,
    }
    if (location) {
      new Release(
        this,
        id,
        Object.assign({}, releaseConfig, { chart: location }),
      )
    } else {
      new Release(
        this,
        id,
        Object.assign({}, releaseConfig, {
          repository: repo,
          chart: name,
        }),
      )
    }
  }
}

export { HelmChartStack }
