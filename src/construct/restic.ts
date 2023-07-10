import { TerraformStack, GcsBackend } from "cdktf"
import { Construct } from "constructs"
import { KubernetesProvider } from "@cdktf/provider-kubernetes/lib/provider"
import { Job } from "@cdktf/provider-kubernetes/lib/job"
import { readFileSync } from "fs"

type Provider = {
  config: string
  remote: boolean
  credentials: string
  bucketName: string
  bucketPrefix: string
}

type Resource = {
  secretName: string
  namespace: string
  image: string
  backupBucketName: string
}

type RepositoryStackProperties = {
  provider: Provider
  resource: Resource
}
type containersProperties = {
  name: string
  secretName: string
  image: string
  bucketName: string
}

class RepositoryStack extends TerraformStack {
  constructor(
    scope: Construct,
    id: string,
    options: RepositoryStackProperties,
  ) {
    const {
      provider: { remote, credentials, bucketName, bucketPrefix, config },
      resource: { image, namespace, secretName, backupBucketName },
    } = options
    super(scope, id)
    if (remote) {
      new GcsBackend(this, {
        bucket: bucketName,
        prefix: bucketPrefix,
        credentials: readFileSync(credentials).toString(),
      })
    }
    new KubernetesProvider(this, `${id}-provider`, { configPath: config })
    const metadata = {
      name: id,
      namespace: namespace,
    }
    new Job(this, id, {
      metadata,
      spec: {
        backoffLimit: 0,
        template: {
          metadata: this.#template_metadata(`${id}-template`),
          spec: {
            volume: this.#volumes(`${id}-volumes`, secretName),
            restartPolicy: "Never",
            container: this.#containers({
              name: `${id}-container`,
              bucketName: backupBucketName,
              secretName,
              image,
            }),
          },
        },
      },
    })
  }
  #containers({ name, secretName, image, bucketName }: containersProperties) {
    return [
      {
        name,
        image,
        command: ["restic", "-r", `gs:${bucketName}:/`, "init"],
        volumeMounts: this.#volumeMounts(`${name}-secret-volume`),
        env: [
          ...this.#env(secretName),
          {
            name: "GOOGLE_APPLICATION_CREDENTIALS",
            value: "/var/secret/credentials.json",
          },
        ],
      },
    ]
  }
  #env(secretName: string) {
    return [
      { name: "RESTIC_PASSWORD", key: "restic.password" },
      { name: "GOOGLE_PROJECT_ID", key: "gcs.project" },
    ].map(({ name, key }) => {
      return {
        name,
        valueFrom: {
          secretKeyRef: {
            key,
            name: secretName,
          },
        },
      }
    })
  }
  #volumeMounts(name: string) {
    return [{ name, mountPath: "/var/secret" }]
  }
  #template_metadata(name: string) {
    return { name }
  }
  #volumes(name: string, secretName: string) {
    return [
      {
        name: name,
        secret: {
          secretName,
          items: [
            {
              key: "gcsbucket.credentials",
              path: "credentials.json",
            },
          ],
        },
      },
    ]
  }
}

/* apiVersion: batch/v1
kind: Job
metadata:
  name: my-job
spec:
  template:
    spec:
      containers:
        - name: my-container
          image: my-image
          env:
            - name: GOOGLE_APPLICATION_CREDENTIALS
              valueFrom:
                secretKeyRef:
                  name: my-secrets
                  key: gcsbucket.credentials
            - name: GOOGLE_PROJECT_ID
              valueFrom:
                secretKeyRef:
                  name: my-secrets
                  key: gcs.project
            - name: RESTIC_REPOSITORY
              valueFrom:
                secretKeyRef:
                  name: my-secrets
                  key: restic.name
            - name: RESTIC_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: my-secrets
                  key: restic.password
      restartPolicy: Never
  backoffLimit: 0 */

/* apiVersion: batch/v1
kind: Job
metadata:
  name: my-job
spec:
  template:
    spec:
      containers:
        - name: my-container
          image: my-image
          env:
            - name: GOOGLE_APPLICATION_CREDENTIALS
              value: /var/secret/credentials.json
          volumeMounts:
            - name: secret-volume
              mountPath: /var/secret
      restartPolicy: Never
  backoffLimit: 0
  volumes:
    - name: secret-volume
      secret:
        secretName: dictybase.staging
        items:
          - key: gcsbucket.credentials
            path: credentials.json */

export { RepositoryStack }
