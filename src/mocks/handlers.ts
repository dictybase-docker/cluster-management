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
  rest.get(
    "https://api.github.com/repos/ccm/ccm/contents/:path",
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          name: "manifest.yaml",
          path: "deploy/packages/default/manifest.yaml",
          sha: "31ec41a98a4279ec287b82afb33326c7986dac6f",
          size: 7520,
          url: "https://api.github.com/repos/kubernetes/cloud-provider-gcp/contents/deploy/packages/default/manifest.yaml?ref=master",
          html_url:
            "https://github.com/kubernetes/cloud-provider-gcp/blob/master/deploy/packages/default/manifest.yaml",
          git_url:
            "https://api.github.com/repos/kubernetes/cloud-provider-gcp/git/blobs/31ec41a98a4279ec287b82afb33326c7986dac6f",
          download_url:
            "https://raw.githubusercontent.com/kubernetes/cloud-provider-gcp/ccm/v26.4.0/deploy/packages/default/manifest.yaml",
          type: "file",
          content:
            "LS0tCmFwaVZlcnNpb246IGFwcHMvdjEKa2luZDogRGFlbW9uU2V0Cm1ldGFk\nYXRhOgogIG5hbWU6IGNsb3VkLWNvbnRyb2xsZXItbWFuYWdlcgogIG5hbWVz\ncGFjZToga3ViZS1zeXN0ZW0KICBsYWJlbHM6CiAgICBjb21wb25lbnQ6IGNs\nb3VkLWNvbnRyb2xsZXItbWFuYWdlcgogICAgYWRkb24ua29wcy5rOHMuaW8v\nbmFtZTogZ2NwLWNsb3VkLWNvbnRyb2xsZXIuYWRkb25zLms4cy5pbwpzcGVj\nOgogIHNlbGVjdG9yOgogICAgbWF0Y2hMYWJlbHM6CiAgICAgIGNvbXBvbmVu\ndDogY2xvdWQtY29udHJvbGxlci1tYW5hZ2VyCiAgdXBkYXRlU3RyYXRlZ3k6\nCiAgICB0eXBlOiBSb2xsaW5nVXBkYXRlCiAgdGVtcGxhdGU6CiAgICBtZXRh\nZGF0YToKICAgICAgbGFiZWxzOgogICAgICAgIHRpZXI6IGNvbnRyb2wtcGxh\nbmUKICAgICAgICBjb21wb25lbnQ6IGNsb3VkLWNvbnRyb2xsZXItbWFuYWdl\ncgogICAgc3BlYzoKICAgICAgbm9kZVNlbGVjdG9yOiBudWxsCiAgICAgIGFm\nZmluaXR5OgogICAgICAgIG5vZGVBZmZpbml0eToKICAgICAgICAgIHJlcXVp\ncmVkRHVyaW5nU2NoZWR1bGluZ0lnbm9yZWREdXJpbmdFeGVjdXRpb246CiAg\nICAgICAgICAgIG5vZGVTZWxlY3RvclRlcm1zOgogICAgICAgICAgICAtIG1h\ndGNoRXhwcmVzc2lvbnM6CiAgICAgICAgICAgICAgLSBrZXk6IG5vZGUtcm9s\nZS5rdWJlcm5ldGVzLmlvL2NvbnRyb2wtcGxhbmUKICAgICAgICAgICAgICAg\nIG9wZXJhdG9yOiBFeGlzdHMKICAgICAgICAgICAgLSBtYXRjaEV4cHJlc3Np\nb25zOgogICAgICAgICAgICAgIC0ga2V5OiBub2RlLXJvbGUua3ViZXJuZXRl\ncy5pby9tYXN0ZXIKICAgICAgICAgICAgICAgIG9wZXJhdG9yOiBFeGlzdHMK\nICAgICAgdG9sZXJhdGlvbnM6CiAgICAgIC0ga2V5OiBub2RlLmNsb3VkcHJv\ndmlkZXIua3ViZXJuZXRlcy5pby91bmluaXRpYWxpemVkCiAgICAgICAgdmFs\ndWU6ICJ0cnVlIgogICAgICAgIGVmZmVjdDogTm9TY2hlZHVsZQogICAgICAt\nIGtleTogbm9kZS5rdWJlcm5ldGVzLmlvL25vdC1yZWFkeQogICAgICAgIGVm\nZmVjdDogTm9TY2hlZHVsZQogICAgICAtIGtleTogbm9kZS1yb2xlLmt1YmVy\nbmV0ZXMuaW8vbWFzdGVyCiAgICAgICAgZWZmZWN0OiBOb1NjaGVkdWxlCiAg\nICAgIC0ga2V5OiBub2RlLXJvbGUua3ViZXJuZXRlcy5pby9jb250cm9sLXBs\nYW5lCiAgICAgICAgZWZmZWN0OiBOb1NjaGVkdWxlCiAgICAgIHNlcnZpY2VB\nY2NvdW50TmFtZTogY2xvdWQtY29udHJvbGxlci1tYW5hZ2VyCiAgICAgIGNv\nbnRhaW5lcnM6CiAgICAgIC0gbmFtZTogY2xvdWQtY29udHJvbGxlci1tYW5h\nZ2VyCiAgICAgICAgaW1hZ2U6IGs4c2Nsb3VkcHJvdmlkZXJnY3AvY2xvdWQt\nY29udHJvbGxlci1tYW5hZ2VyOmxhdGVzdAogICAgICAgIGltYWdlUHVsbFBv\nbGljeTogSWZOb3RQcmVzZW50CiAgICAgICAgIyBrbyBwdXRzIGl0IHNvbWV3\naGVyZSBlbHNlLi4uIGNvbW1hbmQ6IFsnL3Vzci9sb2NhbC9iaW4vY2xvdWQt\nY29udHJvbGxlci1tYW5hZ2VyJ10KICAgICAgICBhcmdzOiBbXSAjIGFyZ3Mg\nbXVzdCBiZSByZXBsYWNlZCBieSB0b29saW5nCiAgICAgICAgZW52OgogICAg\nICAgIC0gbmFtZTogS1VCRVJORVRFU19TRVJWSUNFX0hPU1QKICAgICAgICAg\nIHZhbHVlOiAiMTI3LjAuMC4xIgogICAgICAgIGxpdmVuZXNzUHJvYmU6CiAg\nICAgICAgICBmYWlsdXJlVGhyZXNob2xkOiAzCiAgICAgICAgICBodHRwR2V0\nOgogICAgICAgICAgICBob3N0OiAxMjcuMC4wLjEKICAgICAgICAgICAgcGF0\naDogL2hlYWx0aHoKICAgICAgICAgICAgcG9ydDogMTAyNTgKICAgICAgICAg\nICAgc2NoZW1lOiBIVFRQUwogICAgICAgICAgaW5pdGlhbERlbGF5U2Vjb25k\nczogMTUKICAgICAgICAgIHBlcmlvZFNlY29uZHM6IDEwCiAgICAgICAgICBz\ndWNjZXNzVGhyZXNob2xkOiAxCiAgICAgICAgICB0aW1lb3V0U2Vjb25kczog\nMTUKICAgICAgICByZXNvdXJjZXM6CiAgICAgICAgICByZXF1ZXN0czoKICAg\nICAgICAgICAgY3B1OiAiMjAwbSIKICAgICAgICB2b2x1bWVNb3VudHM6CiAg\nICAgICAgLSBtb3VudFBhdGg6IC9ldGMva3ViZXJuZXRlcy9jbG91ZC5jb25m\naWcKICAgICAgICAgIG5hbWU6IGNsb3VkY29uZmlnCiAgICAgICAgICByZWFk\nT25seTogdHJ1ZQogICAgICBob3N0TmV0d29yazogdHJ1ZQogICAgICBwcmlv\ncml0eUNsYXNzTmFtZTogc3lzdGVtLWNsdXN0ZXItY3JpdGljYWwKICAgICAg\ndm9sdW1lczoKICAgICAgLSBob3N0UGF0aDoKICAgICAgICAgIHBhdGg6IC9l\ndGMva3ViZXJuZXRlcy9jbG91ZC5jb25maWcKICAgICAgICAgIHR5cGU6ICIi\nCiAgICAgICAgbmFtZTogY2xvdWRjb25maWcKLS0tCmFwaVZlcnNpb246IHYx\nCmtpbmQ6IFNlcnZpY2VBY2NvdW50Cm1ldGFkYXRhOgogIG5hbWU6IGNsb3Vk\nLWNvbnRyb2xsZXItbWFuYWdlcgogIG5hbWVzcGFjZToga3ViZS1zeXN0ZW0K\nICBsYWJlbHM6CiAgICBhZGRvbi5rb3BzLms4cy5pby9uYW1lOiBnY3AtY2xv\ndWQtY29udHJvbGxlci5hZGRvbnMuazhzLmlvCgotLS0KYXBpVmVyc2lvbjog\ncmJhYy5hdXRob3JpemF0aW9uLms4cy5pby92MQpraW5kOiBSb2xlQmluZGlu\nZwptZXRhZGF0YToKICBuYW1lOiBjbG91ZC1jb250cm9sbGVyLW1hbmFnZXI6\nYXBpc2VydmVyLWF1dGhlbnRpY2F0aW9uLXJlYWRlcgogIG5hbWVzcGFjZTog\na3ViZS1zeXN0ZW0KICBsYWJlbHM6CiAgICBhZGRvbi5rb3BzLms4cy5pby9u\nYW1lOiBnY3AtY2xvdWQtY29udHJvbGxlci5hZGRvbnMuazhzLmlvCnJvbGVS\nZWY6CiAgYXBpR3JvdXA6IHJiYWMuYXV0aG9yaXphdGlvbi5rOHMuaW8KICBr\naW5kOiBSb2xlCiAgbmFtZTogZXh0ZW5zaW9uLWFwaXNlcnZlci1hdXRoZW50\naWNhdGlvbi1yZWFkZXIKc3ViamVjdHM6Ci0gYXBpR3JvdXA6ICIiCiAga2lu\nZDogU2VydmljZUFjY291bnQKICBuYW1lOiBjbG91ZC1jb250cm9sbGVyLW1h\nbmFnZXIKICBuYW1lc3BhY2U6IGt1YmUtc3lzdGVtCi0tLQoKIyBodHRwczov\nL2dpdGh1Yi5jb20va3ViZXJuZXRlcy9jbG91ZC1wcm92aWRlci1nY3AvYmxv\nYi9tYXN0ZXIvZGVwbG95L2Nsb3VkLW5vZGUtY29udHJvbGxlci1yb2xlLnlh\nbWwKYXBpVmVyc2lvbjogcmJhYy5hdXRob3JpemF0aW9uLms4cy5pby92MQpr\naW5kOiBDbHVzdGVyUm9sZQptZXRhZGF0YToKICBuYW1lOiBzeXN0ZW06Y2xv\ndWQtY29udHJvbGxlci1tYW5hZ2VyCiAgbGFiZWxzOgogICAgYWRkb25tYW5h\nZ2VyLmt1YmVybmV0ZXMuaW8vbW9kZTogUmVjb25jaWxlCiAgICBhZGRvbi5r\nb3BzLms4cy5pby9uYW1lOiBnY3AtY2xvdWQtY29udHJvbGxlci5hZGRvbnMu\nazhzLmlvCnJ1bGVzOgotIGFwaUdyb3VwczoKICAtICIiCiAgLSBldmVudHMu\nazhzLmlvCiAgcmVzb3VyY2VzOgogIC0gZXZlbnRzCiAgdmVyYnM6CiAgLSBj\ncmVhdGUKICAtIHBhdGNoCiAgLSB1cGRhdGUKLSBhcGlHcm91cHM6CiAgLSBj\nb29yZGluYXRpb24uazhzLmlvCiAgcmVzb3VyY2VzOgogIC0gbGVhc2VzCiAg\ndmVyYnM6CiAgLSBjcmVhdGUKICAtIGdldAogIC0gbGlzdAogIC0gd2F0Y2gK\nICAtIHVwZGF0ZQotIGFwaUdyb3VwczoKICAtIGNvb3JkaW5hdGlvbi5rOHMu\naW8KICByZXNvdXJjZU5hbWVzOgogIC0gY2xvdWQtY29udHJvbGxlci1tYW5h\nZ2VyCiAgcmVzb3VyY2VzOgogIC0gbGVhc2VzCiAgdmVyYnM6CiAgLSBnZXQK\nICAtIHVwZGF0ZQotIGFwaUdyb3VwczoKICAtICIiCiAgcmVzb3VyY2VzOgog\nIC0gZW5kcG9pbnRzCiAgLSBzZXJ2aWNlYWNjb3VudHMKICB2ZXJiczoKICAt\nIGNyZWF0ZQogIC0gZ2V0CiAgLSB1cGRhdGUKLSBhcGlHcm91cHM6CiAgLSAi\nIgogIHJlc291cmNlczoKICAtIG5vZGVzCiAgdmVyYnM6CiAgLSBnZXQKICAt\nIHVwZGF0ZQogIC0gcGF0Y2ggIyB1bnRpbCAjMzkzIGxhbmRzCi0gYXBpR3Jv\ndXBzOgogIC0gIiIKICByZXNvdXJjZXM6CiAgLSBuYW1lc3BhY2VzCiAgdmVy\nYnM6CiAgLSBnZXQKLSBhcGlHcm91cHM6CiAgLSAiIgogIHJlc291cmNlczoK\nICAtIG5vZGVzL3N0YXR1cwogIHZlcmJzOgogIC0gcGF0Y2gKICAtIHVwZGF0\nZQotIGFwaUdyb3VwczoKICAtICIiCiAgcmVzb3VyY2VzOgogIC0gc2VjcmV0\ncwogIHZlcmJzOgogIC0gY3JlYXRlCiAgLSBkZWxldGUKICAtIGdldAogIC0g\ndXBkYXRlCi0gYXBpR3JvdXBzOgogIC0gImF1dGhlbnRpY2F0aW9uLms4cy5p\nbyIKICByZXNvdXJjZXM6CiAgLSB0b2tlbnJldmlld3MKICB2ZXJiczoKICAt\nIGNyZWF0ZQotIGFwaUdyb3VwczoKICAtICIqIgogIHJlc291cmNlczoKICAt\nICIqIgogIHZlcmJzOgogIC0gbGlzdAogIC0gd2F0Y2gKLSBhcGlHcm91cHM6\nCiAgLSAiIgogIHJlc291cmNlczoKICAtIHNlcnZpY2VhY2NvdW50cy90b2tl\nbgogIHZlcmJzOgogIC0gY3JlYXRlCi0tLQphcGlWZXJzaW9uOiByYmFjLmF1\ndGhvcml6YXRpb24uazhzLmlvL3YxCmtpbmQ6IFJvbGUKbWV0YWRhdGE6CiAg\nbmFtZTogc3lzdGVtOjpsZWFkZXItbG9ja2luZy1jbG91ZC1jb250cm9sbGVy\nLW1hbmFnZXIKICBuYW1lc3BhY2U6IGt1YmUtc3lzdGVtCiAgbGFiZWxzOgog\nICAgYWRkb25tYW5hZ2VyLmt1YmVybmV0ZXMuaW8vbW9kZTogUmVjb25jaWxl\nCiAgICBhZGRvbi5rb3BzLms4cy5pby9uYW1lOiBnY3AtY2xvdWQtY29udHJv\nbGxlci5hZGRvbnMuazhzLmlvCnJ1bGVzOgotIGFwaUdyb3VwczoKICAtICIi\nCiAgcmVzb3VyY2VzOgogIC0gY29uZmlnbWFwcwogIHZlcmJzOgogIC0gd2F0\nY2gKLSBhcGlHcm91cHM6CiAgLSAiIgogIHJlc291cmNlczoKICAtIGNvbmZp\nZ21hcHMKICByZXNvdXJjZU5hbWVzOgogIC0gY2xvdWQtY29udHJvbGxlci1t\nYW5hZ2VyCiAgdmVyYnM6CiAgLSBnZXQKICAtIHVwZGF0ZQotLS0KYXBpVmVy\nc2lvbjogcmJhYy5hdXRob3JpemF0aW9uLms4cy5pby92MQpraW5kOiBDbHVz\ndGVyUm9sZQptZXRhZGF0YToKICBuYW1lOiBzeXN0ZW06Y29udHJvbGxlcjpj\nbG91ZC1ub2RlLWNvbnRyb2xsZXIKICBsYWJlbHM6CiAgICBhZGRvbm1hbmFn\nZXIua3ViZXJuZXRlcy5pby9tb2RlOiBSZWNvbmNpbGUKICAgIGFkZG9uLmtv\ncHMuazhzLmlvL25hbWU6IGdjcC1jbG91ZC1jb250cm9sbGVyLmFkZG9ucy5r\nOHMuaW8KcnVsZXM6Ci0gYXBpR3JvdXBzOgogIC0gIiIKICByZXNvdXJjZXM6\nCiAgLSBldmVudHMKICB2ZXJiczoKICAtIGNyZWF0ZQogIC0gcGF0Y2gKICAt\nIHVwZGF0ZQotIGFwaUdyb3VwczoKICAtICIiCiAgcmVzb3VyY2VzOgogIC0g\nbm9kZXMKICB2ZXJiczoKICAtIGdldAogIC0gbGlzdAogIC0gdXBkYXRlCiAg\nLSBkZWxldGUKICAtIHBhdGNoCi0gYXBpR3JvdXBzOgogIC0gIiIKICByZXNv\ndXJjZXM6CiAgLSBub2Rlcy9zdGF0dXMKICB2ZXJiczoKICAtIGdldAogIC0g\nbGlzdAogIC0gdXBkYXRlCiAgLSBkZWxldGUKICAtIHBhdGNoCgotIGFwaUdy\nb3VwczoKICAtICIiCiAgcmVzb3VyY2VzOgogIC0gcG9kcwogIHZlcmJzOgog\nIC0gbGlzdAogIC0gZGVsZXRlCi0gYXBpR3JvdXBzOgogIC0gIiIKICByZXNv\ndXJjZXM6CiAgLSBwb2RzL3N0YXR1cwogIHZlcmJzOgogIC0gbGlzdAogIC0g\nZGVsZXRlCi0tLQoKIyBodHRwczovL2dpdGh1Yi5jb20va3ViZXJuZXRlcy9j\nbG91ZC1wcm92aWRlci1nY3AvYmxvYi9tYXN0ZXIvZGVwbG95L2Nsb3VkLW5v\nZGUtY29udHJvbGxlci1iaW5kaW5nLnlhbWwKYXBpVmVyc2lvbjogcmJhYy5h\ndXRob3JpemF0aW9uLms4cy5pby92MQpraW5kOiBSb2xlQmluZGluZwptZXRh\nZGF0YToKICBuYW1lOiBzeXN0ZW06OmxlYWRlci1sb2NraW5nLWNsb3VkLWNv\nbnRyb2xsZXItbWFuYWdlcgogIG5hbWVzcGFjZToga3ViZS1zeXN0ZW0KICBs\nYWJlbHM6CiAgICBhZGRvbm1hbmFnZXIua3ViZXJuZXRlcy5pby9tb2RlOiBS\nZWNvbmNpbGUKICAgIGFkZG9uLmtvcHMuazhzLmlvL25hbWU6IGdjcC1jbG91\nZC1jb250cm9sbGVyLmFkZG9ucy5rOHMuaW8Kcm9sZVJlZjoKICBhcGlHcm91\ncDogcmJhYy5hdXRob3JpemF0aW9uLms4cy5pbwogIGtpbmQ6IFJvbGUKICBu\nYW1lOiBzeXN0ZW06OmxlYWRlci1sb2NraW5nLWNsb3VkLWNvbnRyb2xsZXIt\nbWFuYWdlcgpzdWJqZWN0czoKLSBraW5kOiBTZXJ2aWNlQWNjb3VudAogIG5h\nbWU6IGNsb3VkLWNvbnRyb2xsZXItbWFuYWdlcgogIG5hbWVzcGFjZToga3Vi\nZS1zeXN0ZW0KLS0tCmFwaVZlcnNpb246IHJiYWMuYXV0aG9yaXphdGlvbi5r\nOHMuaW8vdjEKa2luZDogQ2x1c3RlclJvbGVCaW5kaW5nCm1ldGFkYXRhOgog\nIG5hbWU6IHN5c3RlbTpjbG91ZC1jb250cm9sbGVyLW1hbmFnZXIKICBsYWJl\nbHM6CiAgICBhZGRvbm1hbmFnZXIua3ViZXJuZXRlcy5pby9tb2RlOiBSZWNv\nbmNpbGUKICAgIGFkZG9uLmtvcHMuazhzLmlvL25hbWU6IGdjcC1jbG91ZC1j\nb250cm9sbGVyLmFkZG9ucy5rOHMuaW8Kcm9sZVJlZjoKICBhcGlHcm91cDog\ncmJhYy5hdXRob3JpemF0aW9uLms4cy5pbwogIGtpbmQ6IENsdXN0ZXJSb2xl\nCiAgbmFtZTogc3lzdGVtOmNsb3VkLWNvbnRyb2xsZXItbWFuYWdlcgpzdWJq\nZWN0czoKLSBraW5kOiBTZXJ2aWNlQWNjb3VudAogIGFwaUdyb3VwOiAiIgog\nIG5hbWU6IGNsb3VkLWNvbnRyb2xsZXItbWFuYWdlcgogIG5hbWVzcGFjZTog\na3ViZS1zeXN0ZW0KLS0tCmFwaVZlcnNpb246IHJiYWMuYXV0aG9yaXphdGlv\nbi5rOHMuaW8vdjEKa2luZDogQ2x1c3RlclJvbGVCaW5kaW5nCm1ldGFkYXRh\nOgogIG5hbWU6IHN5c3RlbTpjb250cm9sbGVyOmNsb3VkLW5vZGUtY29udHJv\nbGxlcgogIGxhYmVsczoKICAgIGFkZG9ubWFuYWdlci5rdWJlcm5ldGVzLmlv\nL21vZGU6IFJlY29uY2lsZQogICAgYWRkb24ua29wcy5rOHMuaW8vbmFtZTog\nZ2NwLWNsb3VkLWNvbnRyb2xsZXIuYWRkb25zLms4cy5pbwpyb2xlUmVmOgog\nIGFwaUdyb3VwOiByYmFjLmF1dGhvcml6YXRpb24uazhzLmlvCiAga2luZDog\nQ2x1c3RlclJvbGUKICBuYW1lOiBzeXN0ZW06Y29udHJvbGxlcjpjbG91ZC1u\nb2RlLWNvbnRyb2xsZXIKc3ViamVjdHM6Ci0ga2luZDogU2VydmljZUFjY291\nbnQKICBuYW1lOiBjbG91ZC1ub2RlLWNvbnRyb2xsZXIKICBuYW1lc3BhY2U6\nIGt1YmUtc3lzdGVtCi0tLQoKIyBodHRwczovL2dpdGh1Yi5jb20va3ViZXJu\nZXRlcy9jbG91ZC1wcm92aWRlci1nY3AvYmxvYi9tYXN0ZXIvZGVwbG95L3B2\nbC1jb250cm9sbGVyLXJvbGUueWFtbAphcGlWZXJzaW9uOiByYmFjLmF1dGhv\ncml6YXRpb24uazhzLmlvL3YxCmtpbmQ6IENsdXN0ZXJSb2xlCm1ldGFkYXRh\nOgogIG5hbWU6IHN5c3RlbTpjb250cm9sbGVyOnB2bC1jb250cm9sbGVyCiAg\nbGFiZWxzOgogICAgYWRkb25tYW5hZ2VyLmt1YmVybmV0ZXMuaW8vbW9kZTog\nUmVjb25jaWxlCiAgICBhZGRvbi5rb3BzLms4cy5pby9uYW1lOiBnY3AtY2xv\ndWQtY29udHJvbGxlci5hZGRvbnMuazhzLmlvCnJ1bGVzOgotIGFwaUdyb3Vw\nczoKICAtICIiCiAgcmVzb3VyY2VzOgogIC0gZXZlbnRzCiAgdmVyYnM6CiAg\nLSBjcmVhdGUKICAtIHBhdGNoCiAgLSB1cGRhdGUKLSBhcGlHcm91cHM6CiAg\nLSAiIgogIHJlc291cmNlczoKICAtIHBlcnNpc3RlbnR2b2x1bWVjbGFpbXMK\nICAtIHBlcnNpc3RlbnR2b2x1bWVzCiAgdmVyYnM6CiAgLSBsaXN0CiAgLSB3\nYXRjaAo=\n",
          encoding: "base64",
          _links: {
            self: "https://api.github.com/repos/kubernetes/cloud-provider-gcp/contents/deploy/packages/default/manifest.yaml?ref=master",
            git: "https://api.github.com/repos/kubernetes/cloud-provider-gcp/git/blobs/31ec41a98a4279ec287b82afb33326c7986dac6f",
            html: "https://github.com/kubernetes/cloud-provider-gcp/blob/master/deploy/packages/default/manifest.yaml",
          },
        }),
      )
    },
  ),
]

export { handlers }
