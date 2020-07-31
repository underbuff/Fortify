// generated by cdk8s
import { ApiObject } from 'cdk8s';
import { Construct } from 'constructs';

/**
 * EnterpriseSearch is a Kubernetes CRD to represent Enterprise Search.
 *
 * @schema EnterpriseSearch
 */
export class EnterpriseSearch extends ApiObject {
  /**
   * Defines a "EnterpriseSearch" API object
   * @param scope the scope in which to define this object
   * @param name a scope-local name for the object
   * @param options configuration options
   */
  public constructor(scope: Construct, name: string, options: EnterpriseSearchOptions = {}) {
    super(scope, name, {
      ...options,
      kind: 'EnterpriseSearch',
      apiVersion: 'enterprisesearch.k8s.elastic.co/v1beta1',
    });
  }
}

/**
 * EnterpriseSearch is a Kubernetes CRD to represent Enterprise Search.
 *
 * @schema EnterpriseSearch
 */
export interface EnterpriseSearchOptions {
  /**
   * @schema EnterpriseSearch#metadata
   */
  readonly metadata?: any;

  /**
   * EnterpriseSearchSpec holds the specification of an Enterprise Search resource.
   *
   * @schema EnterpriseSearch#spec
   */
  readonly spec?: EnterpriseSearchSpec;

}

/**
 * EnterpriseSearchSpec holds the specification of an Enterprise Search resource.
 *
 * @schema EnterpriseSearchSpec
 */
export interface EnterpriseSearchSpec {
  /**
   * Config holds the Enterprise Search configuration.
   *
   * @schema EnterpriseSearchSpec#config
   */
  readonly config?: any;

  /**
   * ConfigRef contains a reference to an existing Kubernetes Secret holding the Enterprise Search configuration. Configuration settings are merged and have precedence over settings specified in `config`.
   *
   * @schema EnterpriseSearchSpec#configRef
   */
  readonly configRef?: EnterpriseSearchSpecConfigRef;

  /**
   * Count of Enterprise Search instances to deploy.
   *
   * @schema EnterpriseSearchSpec#count
   */
  readonly count?: number;

  /**
   * ElasticsearchRef is a reference to the Elasticsearch cluster running in the same Kubernetes cluster.
   *
   * @schema EnterpriseSearchSpec#elasticsearchRef
   */
  readonly elasticsearchRef?: EnterpriseSearchSpecElasticsearchRef;

  /**
   * HTTP holds the HTTP layer configuration for Enterprise Search resource.
   *
   * @schema EnterpriseSearchSpec#http
   */
  readonly http?: EnterpriseSearchSpecHttp;

  /**
   * Image is the Enterprise Search Docker image to deploy.
   *
   * @schema EnterpriseSearchSpec#image
   */
  readonly image?: string;

  /**
   * PodTemplate provides customisation options (labels, annotations, affinity rules, resource requests, and so on) for the Enterprise Search pods.
   *
   * @schema EnterpriseSearchSpec#podTemplate
   */
  readonly podTemplate?: any;

  /**
   * ServiceAccountName is used to check access from the current resource to a resource (eg. Elasticsearch) in a different namespace. Can only be used if ECK is enforcing RBAC on references.
   *
   * @schema EnterpriseSearchSpec#serviceAccountName
   */
  readonly serviceAccountName?: string;

  /**
   * Version of Enterprise Search.
   *
   * @schema EnterpriseSearchSpec#version
   */
  readonly version?: string;

}

/**
 * ConfigRef contains a reference to an existing Kubernetes Secret holding the Enterprise Search configuration. Configuration settings are merged and have precedence over settings specified in `config`.
 *
 * @schema EnterpriseSearchSpecConfigRef
 */
export interface EnterpriseSearchSpecConfigRef {
  /**
   * SecretName is the name of the secret.
   *
   * @schema EnterpriseSearchSpecConfigRef#secretName
   */
  readonly secretName?: string;

}

/**
 * ElasticsearchRef is a reference to the Elasticsearch cluster running in the same Kubernetes cluster.
 *
 * @schema EnterpriseSearchSpecElasticsearchRef
 */
export interface EnterpriseSearchSpecElasticsearchRef {
  /**
   * Name of the Kubernetes object.
   *
   * @schema EnterpriseSearchSpecElasticsearchRef#name
   */
  readonly name: string;

  /**
   * Namespace of the Kubernetes object. If empty, defaults to the current namespace.
   *
   * @schema EnterpriseSearchSpecElasticsearchRef#namespace
   */
  readonly namespace?: string;

}

/**
 * HTTP holds the HTTP layer configuration for Enterprise Search resource.
 *
 * @schema EnterpriseSearchSpecHttp
 */
export interface EnterpriseSearchSpecHttp {
  /**
   * Service defines the template for the associated Kubernetes Service object.
   *
   * @schema EnterpriseSearchSpecHttp#service
   */
  readonly service?: EnterpriseSearchSpecHttpService;

  /**
   * TLS defines options for configuring TLS for HTTP.
   *
   * @schema EnterpriseSearchSpecHttp#tls
   */
  readonly tls?: EnterpriseSearchSpecHttpTls;

}

/**
 * Service defines the template for the associated Kubernetes Service object.
 *
 * @schema EnterpriseSearchSpecHttpService
 */
export interface EnterpriseSearchSpecHttpService {
  /**
   * ObjectMeta is the metadata of the service. The name and namespace provided here are managed by ECK and will be ignored.
   *
   * @schema EnterpriseSearchSpecHttpService#metadata
   */
  readonly metadata?: any;

  /**
   * Spec is the specification of the service.
   *
   * @schema EnterpriseSearchSpecHttpService#spec
   */
  readonly spec?: EnterpriseSearchSpecHttpServiceSpec;

}

/**
 * TLS defines options for configuring TLS for HTTP.
 *
 * @schema EnterpriseSearchSpecHttpTls
 */
export interface EnterpriseSearchSpecHttpTls {
  /**
   * Certificate is a reference to a Kubernetes secret that contains the certificate and private key for enabling TLS. The referenced secret should contain the following: 
 - `ca.crt`: The certificate authority (optional). - `tls.crt`: The certificate (or a chain). - `tls.key`: The private key to the first certificate in the certificate chain.
   *
   * @schema EnterpriseSearchSpecHttpTls#certificate
   */
  readonly certificate?: EnterpriseSearchSpecHttpTlsCertificate;

  /**
   * SelfSignedCertificate allows configuring the self-signed certificate generated by the operator.
   *
   * @schema EnterpriseSearchSpecHttpTls#selfSignedCertificate
   */
  readonly selfSignedCertificate?: EnterpriseSearchSpecHttpTlsSelfSignedCertificate;

}

/**
 * Spec is the specification of the service.
 *
 * @schema EnterpriseSearchSpecHttpServiceSpec
 */
export interface EnterpriseSearchSpecHttpServiceSpec {
  /**
   * clusterIP is the IP address of the service and is usually assigned randomly by the master. If an address is specified manually and is not in use by others, it will be allocated to the service; otherwise, creation of the service will fail. This field can not be changed through updates. Valid values are "None", empty string (""), or a valid IP address. "None" can be specified for headless services when proxying is not required. Only applies to types ClusterIP, NodePort, and LoadBalancer. Ignored if type is ExternalName. More info: https://kubernetes.io/docs/concepts/services-networking/service/#virtual-ips-and-service-proxies
   *
   * @schema EnterpriseSearchSpecHttpServiceSpec#clusterIP
   */
  readonly clusterIP?: string;

  /**
   * externalIPs is a list of IP addresses for which nodes in the cluster will also accept traffic for this service.  These IPs are not managed by Kubernetes.  The user is responsible for ensuring that traffic arrives at a node with this IP.  A common example is external load-balancers that are not part of the Kubernetes system.
   *
   * @schema EnterpriseSearchSpecHttpServiceSpec#externalIPs
   */
  readonly externalIPs?: string[];

  /**
   * externalName is the external reference that kubedns or equivalent will return as a CNAME record for this service. No proxying will be involved. Must be a valid RFC-1123 hostname (https://tools.ietf.org/html/rfc1123) and requires Type to be ExternalName.
   *
   * @schema EnterpriseSearchSpecHttpServiceSpec#externalName
   */
  readonly externalName?: string;

  /**
   * externalTrafficPolicy denotes if this Service desires to route external traffic to node-local or cluster-wide endpoints. "Local" preserves the client source IP and avoids a second hop for LoadBalancer and Nodeport type services, but risks potentially imbalanced traffic spreading. "Cluster" obscures the client source IP and may cause a second hop to another node, but should have good overall load-spreading.
   *
   * @schema EnterpriseSearchSpecHttpServiceSpec#externalTrafficPolicy
   */
  readonly externalTrafficPolicy?: string;

  /**
   * healthCheckNodePort specifies the healthcheck nodePort for the service. If not specified, HealthCheckNodePort is created by the service api backend with the allocated nodePort. Will use user-specified nodePort value if specified by the client. Only effects when Type is set to LoadBalancer and ExternalTrafficPolicy is set to Local.
   *
   * @schema EnterpriseSearchSpecHttpServiceSpec#healthCheckNodePort
   */
  readonly healthCheckNodePort?: number;

  /**
   * ipFamily specifies whether this Service has a preference for a particular IP family (e.g. IPv4 vs. IPv6).  If a specific IP family is requested, the clusterIP field will be allocated from that family, if it is available in the cluster.  If no IP family is requested, the cluster's primary IP family will be used. Other IP fields (loadBalancerIP, loadBalancerSourceRanges, externalIPs) and controllers which allocate external load-balancers should use the same IP family.  Endpoints for this Service will be of this family.  This field is immutable after creation. Assigning a ServiceIPFamily not available in the cluster (e.g. IPv6 in IPv4 only cluster) is an error condition and will fail during clusterIP assignment.
   *
   * @schema EnterpriseSearchSpecHttpServiceSpec#ipFamily
   */
  readonly ipFamily?: string;

  /**
   * Only applies to Service Type: LoadBalancer LoadBalancer will get created with the IP specified in this field. This feature depends on whether the underlying cloud-provider supports specifying the loadBalancerIP when a load balancer is created. This field will be ignored if the cloud-provider does not support the feature.
   *
   * @schema EnterpriseSearchSpecHttpServiceSpec#loadBalancerIP
   */
  readonly loadBalancerIP?: string;

  /**
   * If specified and supported by the platform, this will restrict traffic through the cloud-provider load-balancer will be restricted to the specified client IPs. This field will be ignored if the cloud-provider does not support the feature." More info: https://kubernetes.io/docs/tasks/access-application-cluster/configure-cloud-provider-firewall/
   *
   * @schema EnterpriseSearchSpecHttpServiceSpec#loadBalancerSourceRanges
   */
  readonly loadBalancerSourceRanges?: string[];

  /**
   * The list of ports that are exposed by this service. More info: https://kubernetes.io/docs/concepts/services-networking/service/#virtual-ips-and-service-proxies
   *
   * @schema EnterpriseSearchSpecHttpServiceSpec#ports
   */
  readonly ports?: EnterpriseSearchSpecHttpServiceSpecPorts[];

  /**
   * publishNotReadyAddresses, when set to true, indicates that DNS implementations must publish the notReadyAddresses of subsets for the Endpoints associated with the Service. The default value is false. The primary use case for setting this field is to use a StatefulSet's Headless Service to propagate SRV records for its Pods without respect to their readiness for purpose of peer discovery.
   *
   * @schema EnterpriseSearchSpecHttpServiceSpec#publishNotReadyAddresses
   */
  readonly publishNotReadyAddresses?: boolean;

  /**
   * Route service traffic to pods with label keys and values matching this selector. If empty or not present, the service is assumed to have an external process managing its endpoints, which Kubernetes will not modify. Only applies to types ClusterIP, NodePort, and LoadBalancer. Ignored if type is ExternalName. More info: https://kubernetes.io/docs/concepts/services-networking/service/
   *
   * @schema EnterpriseSearchSpecHttpServiceSpec#selector
   */
  readonly selector?: { [key: string]: string };

  /**
   * Supports "ClientIP" and "None". Used to maintain session affinity. Enable client IP based session affinity. Must be ClientIP or None. Defaults to None. More info: https://kubernetes.io/docs/concepts/services-networking/service/#virtual-ips-and-service-proxies
   *
   * @default None. More info: https://kubernetes.io/docs/concepts/services-networking/service/#virtual-ips-and-service-proxies
   * @schema EnterpriseSearchSpecHttpServiceSpec#sessionAffinity
   */
  readonly sessionAffinity?: string;

  /**
   * sessionAffinityConfig contains the configurations of session affinity.
   *
   * @schema EnterpriseSearchSpecHttpServiceSpec#sessionAffinityConfig
   */
  readonly sessionAffinityConfig?: EnterpriseSearchSpecHttpServiceSpecSessionAffinityConfig;

  /**
   * topologyKeys is a preference-order list of topology keys which implementations of services should use to preferentially sort endpoints when accessing this Service, it can not be used at the same time as externalTrafficPolicy=Local. Topology keys must be valid label keys and at most 16 keys may be specified. Endpoints are chosen based on the first topology key with available backends. If this field is specified and all entries have no backends that match the topology of the client, the service has no backends for that client and connections should fail. The special value "*" may be used to mean "any topology". This catch-all value, if used, only makes sense as the last value in the list. If this is not specified or empty, no topology constraints will be applied.
   *
   * @schema EnterpriseSearchSpecHttpServiceSpec#topologyKeys
   */
  readonly topologyKeys?: string[];

  /**
   * type determines how the Service is exposed. Defaults to ClusterIP. Valid options are ExternalName, ClusterIP, NodePort, and LoadBalancer. "ExternalName" maps to the specified externalName. "ClusterIP" allocates a cluster-internal IP address for load-balancing to endpoints. Endpoints are determined by the selector or if that is not specified, by manual construction of an Endpoints object. If clusterIP is "None", no virtual IP is allocated and the endpoints are published as a set of endpoints rather than a stable IP. "NodePort" builds on ClusterIP and allocates a port on every node which routes to the clusterIP. "LoadBalancer" builds on NodePort and creates an external load-balancer (if supported in the current cloud) which routes to the clusterIP. More info: https://kubernetes.io/docs/concepts/services-networking/service/#publishing-services-service-types
   *
   * @default ClusterIP. Valid options are ExternalName, ClusterIP, NodePort, and LoadBalancer. "ExternalName" maps to the specified externalName. "ClusterIP" allocates a cluster-internal IP address for load-balancing to endpoints. Endpoints are determined by the selector or if that is not specified, by manual construction of an Endpoints object. If clusterIP is "None", no virtual IP is allocated and the endpoints are published as a set of endpoints rather than a stable IP. "NodePort" builds on ClusterIP and allocates a port on every node which routes to the clusterIP. "LoadBalancer" builds on NodePort and creates an external load-balancer (if supported in the current cloud) which routes to the clusterIP. More info: https://kubernetes.io/docs/concepts/services-networking/service/#publishing-services-service-types
   * @schema EnterpriseSearchSpecHttpServiceSpec#type
   */
  readonly type?: string;

}

/**
 * Certificate is a reference to a Kubernetes secret that contains the certificate and private key for enabling TLS. The referenced secret should contain the following: 
 - `ca.crt`: The certificate authority (optional). - `tls.crt`: The certificate (or a chain). - `tls.key`: The private key to the first certificate in the certificate chain.
 *
 * @schema EnterpriseSearchSpecHttpTlsCertificate
 */
export interface EnterpriseSearchSpecHttpTlsCertificate {
  /**
   * SecretName is the name of the secret.
   *
   * @schema EnterpriseSearchSpecHttpTlsCertificate#secretName
   */
  readonly secretName?: string;

}

/**
 * SelfSignedCertificate allows configuring the self-signed certificate generated by the operator.
 *
 * @schema EnterpriseSearchSpecHttpTlsSelfSignedCertificate
 */
export interface EnterpriseSearchSpecHttpTlsSelfSignedCertificate {
  /**
   * Disabled indicates that the provisioning of the self-signed certifcate should be disabled.
   *
   * @schema EnterpriseSearchSpecHttpTlsSelfSignedCertificate#disabled
   */
  readonly disabled?: boolean;

  /**
   * SubjectAlternativeNames is a list of SANs to include in the generated HTTP TLS certificate.
   *
   * @schema EnterpriseSearchSpecHttpTlsSelfSignedCertificate#subjectAltNames
   */
  readonly subjectAltNames?: EnterpriseSearchSpecHttpTlsSelfSignedCertificateSubjectAltNames[];

}

/**
 * ServicePort contains information on service's port.
 *
 * @schema EnterpriseSearchSpecHttpServiceSpecPorts
 */
export interface EnterpriseSearchSpecHttpServiceSpecPorts {
  /**
   * The name of this port within the service. This must be a DNS_LABEL. All ports within a ServiceSpec must have unique names. When considering the endpoints for a Service, this must match the 'name' field in the EndpointPort. Optional if only one ServicePort is defined on this service.
   *
   * @schema EnterpriseSearchSpecHttpServiceSpecPorts#name
   */
  readonly name?: string;

  /**
   * The port on each node on which this service is exposed when type=NodePort or LoadBalancer. Usually assigned by the system. If specified, it will be allocated to the service if unused or else creation of the service will fail. Default is to auto-allocate a port if the ServiceType of this Service requires one. More info: https://kubernetes.io/docs/concepts/services-networking/service/#type-nodeport
   *
   * @default to auto-allocate a port if the ServiceType of this Service requires one. More info: https://kubernetes.io/docs/concepts/services-networking/service/#type-nodeport
   * @schema EnterpriseSearchSpecHttpServiceSpecPorts#nodePort
   */
  readonly nodePort?: number;

  /**
   * The port that will be exposed by this service.
   *
   * @schema EnterpriseSearchSpecHttpServiceSpecPorts#port
   */
  readonly port: number;

  /**
   * The IP protocol for this port. Supports "TCP", "UDP", and "SCTP". Default is TCP.
   *
   * @default TCP.
   * @schema EnterpriseSearchSpecHttpServiceSpecPorts#protocol
   */
  readonly protocol?: string;

  /**
   * Number or name of the port to access on the pods targeted by the service. Number must be in the range 1 to 65535. Name must be an IANA_SVC_NAME. If this is a string, it will be looked up as a named port in the target Pod's container ports. If this is not specified, the value of the 'port' field is used (an identity map). This field is ignored for services with clusterIP=None, and should be omitted or set equal to the 'port' field. More info: https://kubernetes.io/docs/concepts/services-networking/service/#defining-a-service
   *
   * @schema EnterpriseSearchSpecHttpServiceSpecPorts#targetPort
   */
  readonly targetPort?: EnterpriseSearchSpecHttpServiceSpecPortsTargetPort;

}

/**
 * sessionAffinityConfig contains the configurations of session affinity.
 *
 * @schema EnterpriseSearchSpecHttpServiceSpecSessionAffinityConfig
 */
export interface EnterpriseSearchSpecHttpServiceSpecSessionAffinityConfig {
  /**
   * clientIP contains the configurations of Client IP based session affinity.
   *
   * @schema EnterpriseSearchSpecHttpServiceSpecSessionAffinityConfig#clientIP
   */
  readonly clientIP?: EnterpriseSearchSpecHttpServiceSpecSessionAffinityConfigClientIp;

}

/**
 * SubjectAlternativeName represents a SAN entry in a x509 certificate.
 *
 * @schema EnterpriseSearchSpecHttpTlsSelfSignedCertificateSubjectAltNames
 */
export interface EnterpriseSearchSpecHttpTlsSelfSignedCertificateSubjectAltNames {
  /**
   * DNS is the DNS name of the subject.
   *
   * @schema EnterpriseSearchSpecHttpTlsSelfSignedCertificateSubjectAltNames#dns
   */
  readonly dns?: string;

  /**
   * IP is the IP address of the subject.
   *
   * @schema EnterpriseSearchSpecHttpTlsSelfSignedCertificateSubjectAltNames#ip
   */
  readonly ip?: string;

}

/**
 * Number or name of the port to access on the pods targeted by the service. Number must be in the range 1 to 65535. Name must be an IANA_SVC_NAME. If this is a string, it will be looked up as a named port in the target Pod's container ports. If this is not specified, the value of the 'port' field is used (an identity map). This field is ignored for services with clusterIP=None, and should be omitted or set equal to the 'port' field. More info: https://kubernetes.io/docs/concepts/services-networking/service/#defining-a-service
 *
 * @schema EnterpriseSearchSpecHttpServiceSpecPortsTargetPort
 */
export class EnterpriseSearchSpecHttpServiceSpecPortsTargetPort {
  public static fromNumber(value: number): EnterpriseSearchSpecHttpServiceSpecPortsTargetPort {
    return new EnterpriseSearchSpecHttpServiceSpecPortsTargetPort(value);
  }
  public static fromString(value: string): EnterpriseSearchSpecHttpServiceSpecPortsTargetPort {
    return new EnterpriseSearchSpecHttpServiceSpecPortsTargetPort(value);
  }
  private constructor(value: any) {
    Object.defineProperty(this, 'resolve', { value: () => value });
  }
}

/**
 * clientIP contains the configurations of Client IP based session affinity.
 *
 * @schema EnterpriseSearchSpecHttpServiceSpecSessionAffinityConfigClientIp
 */
export interface EnterpriseSearchSpecHttpServiceSpecSessionAffinityConfigClientIp {
  /**
   * timeoutSeconds specifies the seconds of ClientIP type session sticky time. The value must be >0 && <=86400(for 1 day) if ServiceAffinity == "ClientIP". Default value is 10800(for 3 hours).
   *
   * @schema EnterpriseSearchSpecHttpServiceSpecSessionAffinityConfigClientIp#timeoutSeconds
   */
  readonly timeoutSeconds?: number;

}

