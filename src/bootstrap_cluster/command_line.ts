import yargs from "yargs/yargs"

const argv = yargs(process.argv.slice(2))
  .options({
    ho: {
      alias: "host",
      type: "string",
      description: "remote ssh server",
      demandOption: true,
    },
    u: {
      alias: "user",
      type: "string",
      description: "user name for remote server",
      default: "newman",
    },
    sk: {
      alias: "ssh-key",
      description: "private ssh key file that will be used for login",
      type: "string",
      default: "k8sVM",
    },
    ss: {
      alias: "script",
      type: "string",
      default: "bootstrap_microk8s.sh",
      description: "script to execute on remote server",
    },
    l: {
      alias: "log-level",
      type: "string",
      default: "error",
      description: "logging level, should be one of debug,info,warn,error",
    },
    kc: {
      alias: "kubeconfig",
      type: "string",
      default: "kubeconfig",
      description: "kubernetes config file of k8s cluster",
    },
    i: {
      alias: "input",
      type: "string",
      default: "ip.json",
      description:
        "json output file generated from terraform run containing the public ips of vm instance",
    },
  })
  .parseSync()

export { argv }
