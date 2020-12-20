// generated by cdk8s
import { ApiObject, GroupVersionKind } from 'cdk8s';
import { Construct } from 'constructs';

/**
 * Beat is the Schema for the Beats API.
 *
 * @schema Beat
 */
export class Beat extends ApiObject {
  /**
   * Returns the apiVersion and kind for "Beat"
   */
  public static readonly GVK: GroupVersionKind = {
    apiVersion: 'beat.k8s.elastic.co/v1beta1',
    kind: 'Beat',
  }

  /**
   * Renders a Kubernetes manifest for "Beat".
   *
   * This can be used to inline resource manifests inside other objects (e.g. as templates).
   *
   * @param props initialization props
   */
  public static manifest(props: BeatProps = {}): any {
    return {
      ...Beat.GVK,
      ...props,
    };
  }

  /**
   * Defines a "Beat" API object
   * @param scope the scope in which to define this object
   * @param id a scope-local name for the object
   * @param props initialization props
   */
  public constructor(scope: Construct, id: string, props: BeatProps = {}) {
    super(scope, id, Beat.manifest(props));
  }
}

/**
 * Beat is the Schema for the Beats API.
 *
 * @schema Beat
 */
export interface BeatProps {
  /**
   * @schema Beat#metadata
   */
  readonly metadata?: any;

  /**
   * BeatSpec defines the desired state of a Beat.
   *
   * @schema Beat#spec
   */
  readonly spec?: BeatSpec;

}

/**
 * BeatSpec defines the desired state of a Beat.
 *
 * @schema BeatSpec
 */
export interface BeatSpec {
  /**
   * Config holds the Beat configuration. At most one of [`Config`, `ConfigRef`] can be specified.
   *
   * @schema BeatSpec#config
   */
  readonly config?: any;

  /**
   * ConfigRef contains a reference to an existing Kubernetes Secret holding the Beat configuration. Beat settings must be specified as yaml, under a single "beat.yml" entry. At most one of [`Config`, `ConfigRef`] can be specified.
   *
   * @schema BeatSpec#configRef
   */
  readonly configRef?: BeatSpecConfigRef;

  /**
   * DaemonSet specifies the Beat should be deployed as a DaemonSet, and allows providing its spec. Cannot be used along with `deployment`. If both are absent a default for the Type is used.
   *
   * @schema BeatSpec#daemonSet
   */
  readonly daemonSet?: BeatSpecDaemonSet;

  /**
   * Deployment specifies the Beat should be deployed as a Deployment, and allows providing its spec. Cannot be used along with `daemonSet`. If both are absent a default for the Type is used.
   *
   * @schema BeatSpec#deployment
   */
  readonly deployment?: BeatSpecDeployment;

  /**
   * ElasticsearchRef is a reference to an Elasticsearch cluster running in the same Kubernetes cluster.
   *
   * @schema BeatSpec#elasticsearchRef
   */
  readonly elasticsearchRef?: BeatSpecElasticsearchRef;

  /**
   * Image is the Beat Docker image to deploy. Version and Type have to match the Beat in the image.
   *
   * @schema BeatSpec#image
   */
  readonly image?: string;

  /**
   * KibanaRef is a reference to a Kibana instance running in the same Kubernetes cluster. It allows automatic setup of dashboards and visualizations.
   *
   * @schema BeatSpec#kibanaRef
   */
  readonly kibanaRef?: BeatSpecKibanaRef;

  /**
   * SecureSettings is a list of references to Kubernetes Secrets containing sensitive configuration options for the Beat. Secrets data can be then referenced in the Beat config using the Secret's keys or as specified in `Entries` field of each SecureSetting.
   *
   * @schema BeatSpec#secureSettings
   */
  readonly secureSettings?: BeatSpecSecureSettings[];

  /**
   * ServiceAccountName is used to check access from the current resource to Elasticsearch resource in a different namespace. Can only be used if ECK is enforcing RBAC on references.
   *
   * @schema BeatSpec#serviceAccountName
   */
  readonly serviceAccountName?: string;

  /**
   * Type is the type of the Beat to deploy (filebeat, metricbeat, heartbeat, auditbeat, journalbeat, packetbeat, etc.). Any string can be used, but well-known types will have the image field defaulted and have the appropriate Elasticsearch roles created automatically. It also allows for dashboard setup when combined with a `KibanaRef`.
   *
   * @schema BeatSpec#type
   */
  readonly type: string;

  /**
   * Version of the Beat.
   *
   * @schema BeatSpec#version
   */
  readonly version: string;

}

/**
 * ConfigRef contains a reference to an existing Kubernetes Secret holding the Beat configuration. Beat settings must be specified as yaml, under a single "beat.yml" entry. At most one of [`Config`, `ConfigRef`] can be specified.
 *
 * @schema BeatSpecConfigRef
 */
export interface BeatSpecConfigRef {
  /**
   * SecretName is the name of the secret.
   *
   * @schema BeatSpecConfigRef#secretName
   */
  readonly secretName?: string;

}

/**
 * DaemonSet specifies the Beat should be deployed as a DaemonSet, and allows providing its spec. Cannot be used along with `deployment`. If both are absent a default for the Type is used.
 *
 * @schema BeatSpecDaemonSet
 */
export interface BeatSpecDaemonSet {
}

/**
 * Deployment specifies the Beat should be deployed as a Deployment, and allows providing its spec. Cannot be used along with `daemonSet`. If both are absent a default for the Type is used.
 *
 * @schema BeatSpecDeployment
 */
export interface BeatSpecDeployment {
  /**
   * @schema BeatSpecDeployment#replicas
   */
  readonly replicas?: number;

}

/**
 * ElasticsearchRef is a reference to an Elasticsearch cluster running in the same Kubernetes cluster.
 *
 * @schema BeatSpecElasticsearchRef
 */
export interface BeatSpecElasticsearchRef {
  /**
   * Name of the Kubernetes object.
   *
   * @schema BeatSpecElasticsearchRef#name
   */
  readonly name: string;

  /**
   * Namespace of the Kubernetes object. If empty, defaults to the current namespace.
   *
   * @schema BeatSpecElasticsearchRef#namespace
   */
  readonly namespace?: string;

}

/**
 * KibanaRef is a reference to a Kibana instance running in the same Kubernetes cluster. It allows automatic setup of dashboards and visualizations.
 *
 * @schema BeatSpecKibanaRef
 */
export interface BeatSpecKibanaRef {
  /**
   * Name of the Kubernetes object.
   *
   * @schema BeatSpecKibanaRef#name
   */
  readonly name: string;

  /**
   * Namespace of the Kubernetes object. If empty, defaults to the current namespace.
   *
   * @schema BeatSpecKibanaRef#namespace
   */
  readonly namespace?: string;

}

/**
 * SecretSource defines a data source based on a Kubernetes Secret.
 *
 * @schema BeatSpecSecureSettings
 */
export interface BeatSpecSecureSettings {
  /**
   * Entries define how to project each key-value pair in the secret to filesystem paths. If not defined, all keys will be projected to similarly named paths in the filesystem. If defined, only the specified keys will be projected to the corresponding paths.
   *
   * @schema BeatSpecSecureSettings#entries
   */
  readonly entries?: BeatSpecSecureSettingsEntries[];

  /**
   * SecretName is the name of the secret.
   *
   * @schema BeatSpecSecureSettings#secretName
   */
  readonly secretName: string;

}

/**
 * KeyToPath defines how to map a key in a Secret object to a filesystem path.
 *
 * @schema BeatSpecSecureSettingsEntries
 */
export interface BeatSpecSecureSettingsEntries {
  /**
   * Key is the key contained in the secret.
   *
   * @schema BeatSpecSecureSettingsEntries#key
   */
  readonly key: string;

  /**
   * Path is the relative file path to map the key to. Path must not be an absolute file path and must not contain any ".." components.
   *
   * @schema BeatSpecSecureSettingsEntries#path
   */
  readonly path?: string;

}

