import yargs from "yargs/yargs"
import { App } from "cdktf"
import { BootStrapInstanceStack } from "./bootstrap_stack"

const argv = yargs(process.argv.slice(2))
  .options({
    pi: {
      alias: "project-id",
      type: "string",
      demandOption: true,
      description: "the google cloud project id",
    },
    rg: {
      alias: "region",
      type: "string",
      description: "the google cloud region",
      default: "us-central1",
    },
    z: {
      alias: "zone",
      type: "string",
      description: "the google cloud zone",
      default: "us-central1-c",
    },
    lb: {
      alias: "log-bucket",
      description: "name of logging bucket",
      type: "string",
      default: "dicty-log-journal",
    },
    bn: {
      alias: "bucket-name",
      type: "string",
      default: "dicty-terraform-state",
      description: "GCS bucket name where terraform remote state is stored.",
    },
    bp: {
      alias: "bucket-prefix",
      type: "string",
      default: "k0s-cluster-cdktf",
      description:
        "GCS bucket folder prefix where terraform remote state is stored.",
    },
    r: {
      alias: "remote",
      type: "boolean",
      default: true,
      description: "whether the remote gcs backend will be used",
    },
    c: {
      alias: "credentials",
      description: "service account credentials file for google provider",
      type: "string",
      default: "credentials.json",
    },
    sk: {
      alias: "ssh-key",
      description:
        "public ssh key file that will be injected in the vm for login",
      type: "string",
      default: "k8sVM.pub",
    },
    p: {
      alias: "ports",
      type: "array",
      description: "ports that will be opened in the network",
      default: ["8955"],
    },
    ip: {
      alias: "ip-cidr-range",
      type: "string",
      default: "10.0.0.0/8",
      description:
        "The IP range in cidr notation for vpc subnet that will be assigned to nodes",
    },
    mm: {
      alias: "master-machine-type",
      type: "string",
      default: "custom-2-3072",
      description: "The machine type for kubernetes controller",
    },
    md: {
      alias: "master-disk-size",
      type: "number",
      default: 30,
      description: "size of the boot disk of kubernetes master in GB",
    },
    im: {
      alias: "disk-image",
      type: "string",
      default: "ubuntu-minimal-2204-jammy-v20230428",
      description: "disk image for the vm to boot",
    },
  })
  .parseSync()

const app = new App()
new BootStrapInstanceStack(app, "microk8s-instance", {
  remote: argv.r,
  credentials: argv.c,
  bucketName: argv.bn,
  bucketPrefix: argv.bp,
  sshKeyFile: argv.sk,
  project: argv.pi,
  region: argv.rg,
  zone: argv.z,
  ports: argv.p as Array<string>,
  ipCidrRange: argv.ip,
  masterMachineType: argv.mm,
  masterDiskSize: argv.md,
  image: argv.im,
})
app.synth()
