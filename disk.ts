import { Construct } from "constructs"
import { ComputeDisk } from "@cdktf/provider-google/lib/compute-disk"

interface DiskProps {
  /**
   * The size of the disk in GB.
   */
  size: number

  /**
   * The name of the disk.
   */
  name?: string

  /**
   * The image to use for the disk.
   */
  image?: string
}

/**
 * A persistent disk for a Kubernetes cluster.
 */
export class K8Disk extends Construct {
  /**
   * The persistent disk.
   */
  public readonly disk: ComputeDisk

  /**
   * Creates a new persistent disk.
   * @param scope The scope in which to define this construct.
   * @param name The name of the construct.
   * @param props The properties of the construct.
   */
  constructor(scope: Construct, name: string, props: DiskProps) {
    super(scope, name)
    // Define the resource for the persistent disk
    this.disk = new ComputeDisk(this, "k8-disk", {
      image: props.image ?? "rocky-linux-8-optimized-gcp-v20230306",
      name: props.name ?? "k8-disk",
      type: "pd-ssd",
      size: props.size,
    })
  }
}
