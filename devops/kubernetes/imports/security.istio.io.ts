// generated by cdk8s
import { ApiObject, GroupVersionKind } from 'cdk8s';
import { Construct } from 'constructs';

/**
 * 
 *
 * @schema AuthorizationPolicy
 */
export class AuthorizationPolicy extends ApiObject {
  /**
   * Returns the apiVersion and kind for "AuthorizationPolicy"
   */
  public static readonly GVK: GroupVersionKind = {
    apiVersion: 'security.istio.io/v1beta1',
    kind: 'AuthorizationPolicy',
  }

  /**
   * Renders a Kubernetes manifest for "AuthorizationPolicy".
   *
   * This can be used to inline resource manifests inside other objects (e.g. as templates).
   *
   * @param props initialization props
   */
  public static manifest(props: AuthorizationPolicyProps = {}): any {
    return {
      ...AuthorizationPolicy.GVK,
      ...props,
    };
  }

  /**
   * Defines a "AuthorizationPolicy" API object
   * @param scope the scope in which to define this object
   * @param id a scope-local name for the object
   * @param props initialization props
   */
  public constructor(scope: Construct, id: string, props: AuthorizationPolicyProps = {}) {
    super(scope, id, AuthorizationPolicy.manifest(props));
  }
}

/**
 * @schema AuthorizationPolicy
 */
export interface AuthorizationPolicyProps {
  /**
   * Configuration for access control on workloads. See more details at: https://istio.io/docs/reference/config/security/authorization-policy.html
   *
   * @schema AuthorizationPolicy#spec
   */
  readonly spec?: AuthorizationPolicySpec;

}

/**
 * Configuration for access control on workloads. See more details at: https://istio.io/docs/reference/config/security/authorization-policy.html
 *
 * @schema AuthorizationPolicySpec
 */
export interface AuthorizationPolicySpec {
  /**
   * Optional.
   *
   * @schema AuthorizationPolicySpec#action
   */
  readonly action?: AuthorizationPolicySpecAction;

  /**
   * @schema AuthorizationPolicySpec#provider
   */
  readonly provider?: AuthorizationPolicySpecProvider;

  /**
   * Optional.
   *
   * @schema AuthorizationPolicySpec#rules
   */
  readonly rules?: AuthorizationPolicySpecRules[];

  /**
   * Optional.
   *
   * @schema AuthorizationPolicySpec#selector
   */
  readonly selector?: AuthorizationPolicySpecSelector;

}

/**
 * Optional.
 *
 * @schema AuthorizationPolicySpecAction
 */
export enum AuthorizationPolicySpecAction {
  /** ALLOW */
  ALLOW = "ALLOW",
  /** DENY */
  DENY = "DENY",
  /** AUDIT */
  AUDIT = "AUDIT",
  /** CUSTOM */
  CUSTOM = "CUSTOM",
}

/**
 * @schema AuthorizationPolicySpecProvider
 */
export interface AuthorizationPolicySpecProvider {
  /**
   * Specifies the name of the extension provider.
   *
   * @schema AuthorizationPolicySpecProvider#name
   */
  readonly name?: string;

}

/**
 * @schema AuthorizationPolicySpecRules
 */
export interface AuthorizationPolicySpecRules {
  /**
   * Optional.
   *
   * @schema AuthorizationPolicySpecRules#from
   */
  readonly from?: AuthorizationPolicySpecRulesFrom[];

  /**
   * Optional.
   *
   * @schema AuthorizationPolicySpecRules#to
   */
  readonly to?: AuthorizationPolicySpecRulesTo[];

  /**
   * Optional.
   *
   * @schema AuthorizationPolicySpecRules#when
   */
  readonly when?: AuthorizationPolicySpecRulesWhen[];

}

/**
 * Optional.
 *
 * @schema AuthorizationPolicySpecSelector
 */
export interface AuthorizationPolicySpecSelector {
  /**
   * @schema AuthorizationPolicySpecSelector#matchLabels
   */
  readonly matchLabels?: { [key: string]: string };

}

/**
 * @schema AuthorizationPolicySpecRulesFrom
 */
export interface AuthorizationPolicySpecRulesFrom {
  /**
   * Source specifies the source of a request.
   *
   * @schema AuthorizationPolicySpecRulesFrom#source
   */
  readonly source?: AuthorizationPolicySpecRulesFromSource;

}

/**
 * @schema AuthorizationPolicySpecRulesTo
 */
export interface AuthorizationPolicySpecRulesTo {
  /**
   * Operation specifies the operation of a request.
   *
   * @schema AuthorizationPolicySpecRulesTo#operation
   */
  readonly operation?: AuthorizationPolicySpecRulesToOperation;

}

/**
 * @schema AuthorizationPolicySpecRulesWhen
 */
export interface AuthorizationPolicySpecRulesWhen {
  /**
   * The name of an Istio attribute.
   *
   * @schema AuthorizationPolicySpecRulesWhen#key
   */
  readonly key?: string;

  /**
   * Optional.
   *
   * @schema AuthorizationPolicySpecRulesWhen#notValues
   */
  readonly notValues?: string[];

  /**
   * Optional.
   *
   * @schema AuthorizationPolicySpecRulesWhen#values
   */
  readonly values?: string[];

}

/**
 * Source specifies the source of a request.
 *
 * @schema AuthorizationPolicySpecRulesFromSource
 */
export interface AuthorizationPolicySpecRulesFromSource {
  /**
   * Optional.
   *
   * @schema AuthorizationPolicySpecRulesFromSource#ipBlocks
   */
  readonly ipBlocks?: string[];

  /**
   * Optional.
   *
   * @schema AuthorizationPolicySpecRulesFromSource#namespaces
   */
  readonly namespaces?: string[];

  /**
   * Optional.
   *
   * @schema AuthorizationPolicySpecRulesFromSource#notIpBlocks
   */
  readonly notIpBlocks?: string[];

  /**
   * Optional.
   *
   * @schema AuthorizationPolicySpecRulesFromSource#notNamespaces
   */
  readonly notNamespaces?: string[];

  /**
   * Optional.
   *
   * @schema AuthorizationPolicySpecRulesFromSource#notPrincipals
   */
  readonly notPrincipals?: string[];

  /**
   * Optional.
   *
   * @schema AuthorizationPolicySpecRulesFromSource#notRemoteIpBlocks
   */
  readonly notRemoteIpBlocks?: string[];

  /**
   * Optional.
   *
   * @schema AuthorizationPolicySpecRulesFromSource#notRequestPrincipals
   */
  readonly notRequestPrincipals?: string[];

  /**
   * Optional.
   *
   * @schema AuthorizationPolicySpecRulesFromSource#principals
   */
  readonly principals?: string[];

  /**
   * Optional.
   *
   * @schema AuthorizationPolicySpecRulesFromSource#remoteIpBlocks
   */
  readonly remoteIpBlocks?: string[];

  /**
   * Optional.
   *
   * @schema AuthorizationPolicySpecRulesFromSource#requestPrincipals
   */
  readonly requestPrincipals?: string[];

}

/**
 * Operation specifies the operation of a request.
 *
 * @schema AuthorizationPolicySpecRulesToOperation
 */
export interface AuthorizationPolicySpecRulesToOperation {
  /**
   * Optional.
   *
   * @schema AuthorizationPolicySpecRulesToOperation#hosts
   */
  readonly hosts?: string[];

  /**
   * Optional.
   *
   * @schema AuthorizationPolicySpecRulesToOperation#methods
   */
  readonly methods?: string[];

  /**
   * Optional.
   *
   * @schema AuthorizationPolicySpecRulesToOperation#notHosts
   */
  readonly notHosts?: string[];

  /**
   * Optional.
   *
   * @schema AuthorizationPolicySpecRulesToOperation#notMethods
   */
  readonly notMethods?: string[];

  /**
   * Optional.
   *
   * @schema AuthorizationPolicySpecRulesToOperation#notPaths
   */
  readonly notPaths?: string[];

  /**
   * Optional.
   *
   * @schema AuthorizationPolicySpecRulesToOperation#notPorts
   */
  readonly notPorts?: string[];

  /**
   * Optional.
   *
   * @schema AuthorizationPolicySpecRulesToOperation#paths
   */
  readonly paths?: string[];

  /**
   * Optional.
   *
   * @schema AuthorizationPolicySpecRulesToOperation#ports
   */
  readonly ports?: string[];

}

/**
 * 
 *
 * @schema PeerAuthentication
 */
export class PeerAuthentication extends ApiObject {
  /**
   * Returns the apiVersion and kind for "PeerAuthentication"
   */
  public static readonly GVK: GroupVersionKind = {
    apiVersion: 'security.istio.io/v1beta1',
    kind: 'PeerAuthentication',
  }

  /**
   * Renders a Kubernetes manifest for "PeerAuthentication".
   *
   * This can be used to inline resource manifests inside other objects (e.g. as templates).
   *
   * @param props initialization props
   */
  public static manifest(props: PeerAuthenticationProps = {}): any {
    return {
      ...PeerAuthentication.GVK,
      ...props,
    };
  }

  /**
   * Defines a "PeerAuthentication" API object
   * @param scope the scope in which to define this object
   * @param id a scope-local name for the object
   * @param props initialization props
   */
  public constructor(scope: Construct, id: string, props: PeerAuthenticationProps = {}) {
    super(scope, id, PeerAuthentication.manifest(props));
  }
}

/**
 * @schema PeerAuthentication
 */
export interface PeerAuthenticationProps {
  /**
   * PeerAuthentication defines how traffic will be tunneled (or not) to the sidecar.
   *
   * @schema PeerAuthentication#spec
   */
  readonly spec?: PeerAuthenticationSpec;

}

/**
 * PeerAuthentication defines how traffic will be tunneled (or not) to the sidecar.
 *
 * @schema PeerAuthenticationSpec
 */
export interface PeerAuthenticationSpec {
  /**
   * Mutual TLS settings for workload.
   *
   * @schema PeerAuthenticationSpec#mtls
   */
  readonly mtls?: PeerAuthenticationSpecMtls;

  /**
   * Port specific mutual TLS settings.
   *
   * @schema PeerAuthenticationSpec#portLevelMtls
   */
  readonly portLevelMtls?: { [key: string]: PeerAuthenticationSpecPortLevelMtls };

  /**
   * The selector determines the workloads to apply the ChannelAuthentication on.
   *
   * @schema PeerAuthenticationSpec#selector
   */
  readonly selector?: PeerAuthenticationSpecSelector;

}

/**
 * Mutual TLS settings for workload.
 *
 * @schema PeerAuthenticationSpecMtls
 */
export interface PeerAuthenticationSpecMtls {
  /**
   * Defines the mTLS mode used for peer authentication.
   *
   * @schema PeerAuthenticationSpecMtls#mode
   */
  readonly mode?: PeerAuthenticationSpecMtlsMode;

}

/**
 * @schema PeerAuthenticationSpecPortLevelMtls
 */
export interface PeerAuthenticationSpecPortLevelMtls {
  /**
   * Defines the mTLS mode used for peer authentication.
   *
   * @schema PeerAuthenticationSpecPortLevelMtls#mode
   */
  readonly mode?: PeerAuthenticationSpecPortLevelMtlsMode;

}

/**
 * The selector determines the workloads to apply the ChannelAuthentication on.
 *
 * @schema PeerAuthenticationSpecSelector
 */
export interface PeerAuthenticationSpecSelector {
  /**
   * @schema PeerAuthenticationSpecSelector#matchLabels
   */
  readonly matchLabels?: { [key: string]: string };

}

/**
 * Defines the mTLS mode used for peer authentication.
 *
 * @schema PeerAuthenticationSpecMtlsMode
 */
export enum PeerAuthenticationSpecMtlsMode {
  /** UNSET */
  UNSET = "UNSET",
  /** DISABLE */
  DISABLE = "DISABLE",
  /** PERMISSIVE */
  PERMISSIVE = "PERMISSIVE",
  /** STRICT */
  STRICT = "STRICT",
}

/**
 * Defines the mTLS mode used for peer authentication.
 *
 * @schema PeerAuthenticationSpecPortLevelMtlsMode
 */
export enum PeerAuthenticationSpecPortLevelMtlsMode {
  /** UNSET */
  UNSET = "UNSET",
  /** DISABLE */
  DISABLE = "DISABLE",
  /** PERMISSIVE */
  PERMISSIVE = "PERMISSIVE",
  /** STRICT */
  STRICT = "STRICT",
}

/**
 * 
 *
 * @schema RequestAuthentication
 */
export class RequestAuthentication extends ApiObject {
  /**
   * Returns the apiVersion and kind for "RequestAuthentication"
   */
  public static readonly GVK: GroupVersionKind = {
    apiVersion: 'security.istio.io/v1beta1',
    kind: 'RequestAuthentication',
  }

  /**
   * Renders a Kubernetes manifest for "RequestAuthentication".
   *
   * This can be used to inline resource manifests inside other objects (e.g. as templates).
   *
   * @param props initialization props
   */
  public static manifest(props: RequestAuthenticationProps = {}): any {
    return {
      ...RequestAuthentication.GVK,
      ...props,
    };
  }

  /**
   * Defines a "RequestAuthentication" API object
   * @param scope the scope in which to define this object
   * @param id a scope-local name for the object
   * @param props initialization props
   */
  public constructor(scope: Construct, id: string, props: RequestAuthenticationProps = {}) {
    super(scope, id, RequestAuthentication.manifest(props));
  }
}

/**
 * @schema RequestAuthentication
 */
export interface RequestAuthenticationProps {
  /**
   * RequestAuthentication defines what request authentication methods are supported by a workload.
   *
   * @schema RequestAuthentication#spec
   */
  readonly spec?: RequestAuthenticationSpec;

}

/**
 * RequestAuthentication defines what request authentication methods are supported by a workload.
 *
 * @schema RequestAuthenticationSpec
 */
export interface RequestAuthenticationSpec {
  /**
   * Define the list of JWTs that can be validated at the selected workloads' proxy.
   *
   * @schema RequestAuthenticationSpec#jwtRules
   */
  readonly jwtRules?: RequestAuthenticationSpecJwtRules[];

  /**
   * The selector determines the workloads to apply the RequestAuthentication on.
   *
   * @schema RequestAuthenticationSpec#selector
   */
  readonly selector?: RequestAuthenticationSpecSelector;

}

/**
 * @schema RequestAuthenticationSpecJwtRules
 */
export interface RequestAuthenticationSpecJwtRules {
  /**
   * @schema RequestAuthenticationSpecJwtRules#audiences
   */
  readonly audiences?: string[];

  /**
   * If set to true, the orginal token will be kept for the ustream request.
   *
   * @schema RequestAuthenticationSpecJwtRules#forwardOriginalToken
   */
  readonly forwardOriginalToken?: boolean;

  /**
   * List of header locations from which JWT is expected.
   *
   * @schema RequestAuthenticationSpecJwtRules#fromHeaders
   */
  readonly fromHeaders?: RequestAuthenticationSpecJwtRulesFromHeaders[];

  /**
   * List of query parameters from which JWT is expected.
   *
   * @schema RequestAuthenticationSpecJwtRules#fromParams
   */
  readonly fromParams?: string[];

  /**
   * Identifies the issuer that issued the JWT.
   *
   * @schema RequestAuthenticationSpecJwtRules#issuer
   */
  readonly issuer?: string;

  /**
   * JSON Web Key Set of public keys to validate signature of the JWT.
   *
   * @schema RequestAuthenticationSpecJwtRules#jwks
   */
  readonly jwks?: string;

  /**
   * @schema RequestAuthenticationSpecJwtRules#jwksUri
   */
  readonly jwksUri?: string;

  /**
   * @schema RequestAuthenticationSpecJwtRules#outputPayloadToHeader
   */
  readonly outputPayloadToHeader?: string;

}

/**
 * The selector determines the workloads to apply the RequestAuthentication on.
 *
 * @schema RequestAuthenticationSpecSelector
 */
export interface RequestAuthenticationSpecSelector {
  /**
   * @schema RequestAuthenticationSpecSelector#matchLabels
   */
  readonly matchLabels?: { [key: string]: string };

}

/**
 * @schema RequestAuthenticationSpecJwtRulesFromHeaders
 */
export interface RequestAuthenticationSpecJwtRulesFromHeaders {
  /**
   * The HTTP header name.
   *
   * @schema RequestAuthenticationSpecJwtRulesFromHeaders#name
   */
  readonly name?: string;

  /**
   * The prefix that should be stripped before decoding the token.
   *
   * @schema RequestAuthenticationSpecJwtRulesFromHeaders#prefix
   */
  readonly prefix?: string;

}

