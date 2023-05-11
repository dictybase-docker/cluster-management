import { HostNodeProperties } from "../src/k0s_cluster"

const hosts: Array<HostNodeProperties> = [
  {
    address: "10.0.0.1",
    user: "root",
    port: 22,
    keyPath: "~/.ssh/id_rsa",
    role: "controller",
  },
  {
    address: "10.0.0.2",
    user: "root",
    port: 22,
    keyPath: "~/.ssh/id_rsa",
    role: "worker",
  },
  {
    address: "10.0.0.3",
    user: "root",
    port: 22,
    keyPath: "~/.ssh/id_rsa",
    role: "worker",
  },
]
export { hosts }
