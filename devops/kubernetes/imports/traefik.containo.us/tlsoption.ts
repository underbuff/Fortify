// generated by cdk8s
import { ApiObject } from 'cdk8s';
import { Construct } from 'constructs';

/**
 * 
 *
 * @schema TLSOption
 */
export class TlsOption extends ApiObject {
  /**
   * Defines a "TLSOption" API object
   * @param scope the scope in which to define this object
   * @param name a scope-local name for the object
   * @param options configuration options
   */
  public constructor(scope: Construct, name: string, options: TlsOptionOptions = {}) {
    super(scope, name, {
      ...options,
      kind: 'TLSOption',
      apiVersion: 'traefik.containo.us/v1alpha1',
    });
  }
}

/**
 * @schema TLSOption
 */
export interface TlsOptionOptions {
}

