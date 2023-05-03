import { rest } from "msw"

const handlers = [
  rest.get("https://api.github.com/repos/ccm/ccm/tags", (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          name: "providers/v26.0.0",
          zipball_url:
            "https://api.github.com/repos/kubernetes/cloud-provider-gcp/zipball/refs/tags/providers/v26.0.0",
          tarball_url:
            "https://api.github.com/repos/kubernetes/cloud-provider-gcp/tarball/refs/tags/providers/v26.0.0",
          commit: {
            sha: "9d8e49424821c43084e65f0536898cbf436d211d",
            url: "https://api.github.com/repos/kubernetes/cloud-provider-gcp/commits/9d8e49424821c43084e65f0536898cbf436d211d",
          },
          node_id:
            "MDM6UmVmMTI2MTM2ODQ3OnJlZnMvdGFncy9wcm92aWRlcnMvdjI2LjAuMA==",
        },
        {
          name: "providers/v0.26.2",
          zipball_url:
            "https://api.github.com/repos/kubernetes/cloud-provider-gcp/zipball/refs/tags/providers/v0.26.2",
          tarball_url:
            "https://api.github.com/repos/kubernetes/cloud-provider-gcp/tarball/refs/tags/providers/v0.26.2",
          commit: {
            sha: "9283b54f2c6acb10b21c408cacc5cd64e771c666",
            url: "https://api.github.com/repos/kubernetes/cloud-provider-gcp/commits/9283b54f2c6acb10b21c408cacc5cd64e771c666",
          },
          node_id:
            "MDM6UmVmMTI2MTM2ODQ3OnJlZnMvdGFncy9wcm92aWRlcnMvdjAuMjYuMg==",
        },
        {
          name: "providers/v0.25.3",
          zipball_url:
            "https://api.github.com/repos/kubernetes/cloud-provider-gcp/zipball/refs/tags/providers/v0.25.3",
          tarball_url:
            "https://api.github.com/repos/kubernetes/cloud-provider-gcp/tarball/refs/tags/providers/v0.25.3",
          commit: {
            sha: "3d24dccb9fe6afb401500fc91537af1789b9e07d",
            url: "https://api.github.com/repos/kubernetes/cloud-provider-gcp/commits/3d24dccb9fe6afb401500fc91537af1789b9e07d",
          },
          node_id:
            "MDM6UmVmMTI2MTM2ODQ3OnJlZnMvdGFncy9wcm92aWRlcnMvdjAuMjUuMw==",
        },
        {
          name: "ccm/v26.0.1",
          zipball_url:
            "https://api.github.com/repos/kubernetes/cloud-provider-gcp/zipball/refs/tags/ccm/v26.0.1",
          tarball_url:
            "https://api.github.com/repos/kubernetes/cloud-provider-gcp/tarball/refs/tags/ccm/v26.0.1",
          commit: {
            sha: "929b1354f904a55d42389ae2a75021042e62e40f",
            url: "https://api.github.com/repos/kubernetes/cloud-provider-gcp/commits/929b1354f904a55d42389ae2a75021042e62e40f",
          },
          node_id: "MDM6UmVmMTI2MTM2ODQ3OnJlZnMvdGFncy9jY20vdjI2LjAuMQ==",
        },
        {
          name: "ccm/v26.2.4",
          zipball_url:
            "https://api.github.com/repos/kubernetes/cloud-provider-gcp/zipball/refs/tags/ccm/v26.2.4",
          tarball_url:
            "https://api.github.com/repos/kubernetes/cloud-provider-gcp/tarball/refs/tags/ccm/v26.2.4",
          commit: {
            sha: "f526dec47e67a65d6d7b263a16dc90da6e0244ae",
            url: "https://api.github.com/repos/kubernetes/cloud-provider-gcp/commits/f526dec47e67a65d6d7b263a16dc90da6e0244ae",
          },
          node_id: "MDM6UmVmMTI2MTM2ODQ3OnJlZnMvdGFncy9jY20vdjI2LjIuNA==",
        },
        {
          name: "ccm/v26.0.0",
          zipball_url:
            "https://api.github.com/repos/kubernetes/cloud-provider-gcp/zipball/refs/tags/ccm/v26.0.0",
          tarball_url:
            "https://api.github.com/repos/kubernetes/cloud-provider-gcp/tarball/refs/tags/ccm/v26.0.0",
          commit: {
            sha: "9d8e49424821c43084e65f0536898cbf436d211d",
            url: "https://api.github.com/repos/kubernetes/cloud-provider-gcp/commits/9d8e49424821c43084e65f0536898cbf436d211d",
          },
          node_id: "MDM6UmVmMTI2MTM2ODQ3OnJlZnMvdGFncy9jY20vdjI2LjAuMA==",
        },
        {
          name: "ccm/v25.5.0",
          zipball_url:
            "https://api.github.com/repos/kubernetes/cloud-provider-gcp/zipball/refs/tags/ccm/v25.5.0",
          tarball_url:
            "https://api.github.com/repos/kubernetes/cloud-provider-gcp/tarball/refs/tags/ccm/v25.5.0",
          commit: {
            sha: "63838834b26d58496228bc41072b12abc544ddff",
            url: "https://api.github.com/repos/kubernetes/cloud-provider-gcp/commits/63838834b26d58496228bc41072b12abc544ddff",
          },
          node_id: "MDM6UmVmMTI2MTM2ODQ3OnJlZnMvdGFncy9jY20vdjI1LjUuMA==",
        },
        {
          name: "ccm/v25.3.0",
          zipball_url:
            "https://api.github.com/repos/kubernetes/cloud-provider-gcp/zipball/refs/tags/ccm/v25.3.0",
          tarball_url:
            "https://api.github.com/repos/kubernetes/cloud-provider-gcp/tarball/refs/tags/ccm/v25.3.0",
          commit: {
            sha: "3d24dccb9fe6afb401500fc91537af1789b9e07d",
            url: "https://api.github.com/repos/kubernetes/cloud-provider-gcp/commits/3d24dccb9fe6afb401500fc91537af1789b9e07d",
          },
          node_id: "MDM6UmVmMTI2MTM2ODQ3OnJlZnMvdGFncy9jY20vdjI1LjMuMA==",
        },
        {
          name: "ccm/v25.2.0",
          zipball_url:
            "https://api.github.com/repos/kubernetes/cloud-provider-gcp/zipball/refs/tags/ccm/v25.2.0",
          tarball_url:
            "https://api.github.com/repos/kubernetes/cloud-provider-gcp/tarball/refs/tags/ccm/v25.2.0",
          commit: {
            sha: "d2b22ad6f19d3b11e9c6e2f308dd69a2bab6d660",
            url: "https://api.github.com/repos/kubernetes/cloud-provider-gcp/commits/d2b22ad6f19d3b11e9c6e2f308dd69a2bab6d660",
          },
          node_id: "MDM6UmVmMTI2MTM2ODQ3OnJlZnMvdGFncy9jY20vdjI1LjIuMA==",
        },
        {
          name: "ccm/v0.0.1",
          zipball_url:
            "https://api.github.com/repos/kubernetes/cloud-provider-gcp/zipball/refs/tags/ccm/v0.0.1",
          tarball_url:
            "https://api.github.com/repos/kubernetes/cloud-provider-gcp/tarball/refs/tags/ccm/v0.0.1",
          commit: {
            sha: "1a944835e6d5357e2fdb624cda7e7e354e3f4951",
            url: "https://api.github.com/repos/kubernetes/cloud-provider-gcp/commits/1a944835e6d5357e2fdb624cda7e7e354e3f4951",
          },
          node_id: "MDM6UmVmMTI2MTM2ODQ3OnJlZnMvdGFncy9jY20vdjAuMC4x",
        },
        {
          name: "auth-provider-gcp/v0.0.1",
          zipball_url:
            "https://api.github.com/repos/kubernetes/cloud-provider-gcp/zipball/refs/tags/auth-provider-gcp/v0.0.1",
          tarball_url:
            "https://api.github.com/repos/kubernetes/cloud-provider-gcp/tarball/refs/tags/auth-provider-gcp/v0.0.1",
          commit: {
            sha: "63838834b26d58496228bc41072b12abc544ddff",
            url: "https://api.github.com/repos/kubernetes/cloud-provider-gcp/commits/63838834b26d58496228bc41072b12abc544ddff",
          },
          node_id:
            "MDM6UmVmMTI2MTM2ODQ3OnJlZnMvdGFncy9hdXRoLXByb3ZpZGVyLWdjcC92MC4wLjE=",
        },
        {
          name: "ccm/v26.4.0",
          zipball_url:
            "https://api.github.com/repos/kubernetes/cloud-provider-gcp/zipball/refs/tags/ccm/v26.4.0",
          tarball_url:
            "https://api.github.com/repos/kubernetes/cloud-provider-gcp/tarball/refs/tags/ccm/v26.4.0",
          commit: {
            sha: "4ab7967b01e9c4818aab0dd128491e0ef40c946c",
            url: "https://api.github.com/repos/kubernetes/cloud-provider-gcp/commits/4ab7967b01e9c4818aab0dd128491e0ef40c946c",
          },
          node_id: "MDM6UmVmMTI2MTM2ODQ3OnJlZnMvdGFncy9jY20vdjI2LjQuMA==",
        },
      ]),
    )
  }),
]

export { handlers }
