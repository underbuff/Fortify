// generated by cdk8s
import { ApiObject } from 'cdk8s';
import { Construct } from 'constructs';

/**
 * 
 *
 * @schema Gateway
 */
export class Gateway extends ApiObject {
  /**
   * Defines a "Gateway" API object
   * @param scope the scope in which to define this object
   * @param name a scope-local name for the object
   * @param options configuration options
   */
  public constructor(scope: Construct, name: string, options: GatewayOptions = {}) {
    super(scope, name, {
      ...options,
      kind: 'Gateway',
      apiVersion: 'networking.istio.io/v1alpha3',
    });
  }
}

/**
 * @schema Gateway
 */
export interface GatewayOptions {
  /**
   * Configuration affecting edge load balancer. See more details at: https://istio.io/docs/reference/config/networking/gateway.html
   *
   * @schema Gateway#spec
   */
  readonly spec?: GatewaySpec;

}

/**
 * Configuration affecting edge load balancer. See more details at: https://istio.io/docs/reference/config/networking/gateway.html
 *
 * @schema GatewaySpec
 */
export interface GatewaySpec {
  /**
   * @schema GatewaySpec#selector
   */
  readonly selector?: { [key: string]: string };

  /**
   * A list of server specifications.
   *
   * @schema GatewaySpec#servers
   */
  readonly servers?: GatewaySpecServers[];

}

/**
 * @schema GatewaySpecServers
 */
export interface GatewaySpecServers {
  /**
   * @schema GatewaySpecServers#bind
   */
  readonly bind?: string;

  /**
   * @schema GatewaySpecServers#defaultEndpoint
   */
  readonly defaultEndpoint?: string;

  /**
   * One or more hosts exposed by this gateway.
   *
   * @schema GatewaySpecServers#hosts
   */
  readonly hosts?: string[];

  /**
   * An optional name of the server, when set must be unique across all servers.
   *
   * @schema GatewaySpecServers#name
   */
  readonly name?: string;

  /**
   * @schema GatewaySpecServers#port
   */
  readonly port?: GatewaySpecServersPort;

  /**
   * Set of TLS related options that govern the server's behavior.
   *
   * @schema GatewaySpecServers#tls
   */
  readonly tls?: GatewaySpecServersTls;

}

/**
 * @schema GatewaySpecServersPort
 */
export interface GatewaySpecServersPort {
  /**
   * Label assigned to the port.
   *
   * @schema GatewaySpecServersPort#name
   */
  readonly name?: string;

  /**
   * A valid non-negative integer port number.
   *
   * @schema GatewaySpecServersPort#number
   */
  readonly number?: number;

  /**
   * The protocol exposed on the port.
   *
   * @schema GatewaySpecServersPort#protocol
   */
  readonly protocol?: string;

  /**
   * @schema GatewaySpecServersPort#targetPort
   */
  readonly targetPort?: number;

}

/**
 * Set of TLS related options that govern the server's behavior.
 *
 * @schema GatewaySpecServersTls
 */
export interface GatewaySpecServersTls {
  /**
   * REQUIRED if mode is `MUTUAL`.
   *
   * @schema GatewaySpecServersTls#caCertificates
   */
  readonly caCertificates?: string;

  /**
   * Optional: If specified, only support the specified cipher list.
   *
   * @schema GatewaySpecServersTls#cipherSuites
   */
  readonly cipherSuites?: string[];

  /**
   * @schema GatewaySpecServersTls#credentialName
   */
  readonly credentialName?: string;

  /**
   * @schema GatewaySpecServersTls#httpsRedirect
   */
  readonly httpsRedirect?: boolean;

  /**
   * Optional: Maximum TLS protocol version.
   *
   * @schema GatewaySpecServersTls#maxProtocolVersion
   */
  readonly maxProtocolVersion?: GatewaySpecServersTlsMaxProtocolVersion;

  /**
   * Optional: Minimum TLS protocol version.
   *
   * @schema GatewaySpecServersTls#minProtocolVersion
   */
  readonly minProtocolVersion?: GatewaySpecServersTlsMinProtocolVersion;

  /**
   * @schema GatewaySpecServersTls#mode
   */
  readonly mode?: GatewaySpecServersTlsMode;

  /**
   * REQUIRED if mode is `SIMPLE` or `MUTUAL`.
   *
   * @schema GatewaySpecServersTls#privateKey
   */
  readonly privateKey?: string;

  /**
   * REQUIRED if mode is `SIMPLE` or `MUTUAL`.
   *
   * @schema GatewaySpecServersTls#serverCertificate
   */
  readonly serverCertificate?: string;

  /**
   * @schema GatewaySpecServersTls#subjectAltNames
   */
  readonly subjectAltNames?: string[];

  /**
   * @schema GatewaySpecServersTls#verifyCertificateHash
   */
  readonly verifyCertificateHash?: string[];

  /**
   * @schema GatewaySpecServersTls#verifyCertificateSpki
   */
  readonly verifyCertificateSpki?: string[];

}

/**
 * Optional: Maximum TLS protocol version.
 *
 * @schema GatewaySpecServersTlsMaxProtocolVersion
 */
export enum GatewaySpecServersTlsMaxProtocolVersion {
  /** TLS_AUTO */
  TLS_AUTO = "TLS_AUTO",
  /** TLSV1_0 */
  TLSV1_0 = "TLSV1_0",
  /** TLSV1_1 */
  TLSV1_1 = "TLSV1_1",
  /** TLSV1_2 */
  TLSV1_2 = "TLSV1_2",
  /** TLSV1_3 */
  TLSV1_3 = "TLSV1_3",
}

/**
 * Optional: Minimum TLS protocol version.
 *
 * @schema GatewaySpecServersTlsMinProtocolVersion
 */
export enum GatewaySpecServersTlsMinProtocolVersion {
  /** TLS_AUTO */
  TLS_AUTO = "TLS_AUTO",
  /** TLSV1_0 */
  TLSV1_0 = "TLSV1_0",
  /** TLSV1_1 */
  TLSV1_1 = "TLSV1_1",
  /** TLSV1_2 */
  TLSV1_2 = "TLSV1_2",
  /** TLSV1_3 */
  TLSV1_3 = "TLSV1_3",
}

/**
 * @schema GatewaySpecServersTlsMode
 */
export enum GatewaySpecServersTlsMode {
  /** PASSTHROUGH */
  PASSTHROUGH = "PASSTHROUGH",
  /** SIMPLE */
  SIMPLE = "SIMPLE",
  /** MUTUAL */
  MUTUAL = "MUTUAL",
  /** AUTO_PASSTHROUGH */
  AUTO_PASSTHROUGH = "AUTO_PASSTHROUGH",
  /** ISTIO_MUTUAL */
  ISTIO_MUTUAL = "ISTIO_MUTUAL",
}

