// generated by cdk8s
import { ApiObject, GroupVersionKind } from 'cdk8s';
import { Construct } from 'constructs';

/**
 * 
 *
 * @schema RedisFailover
 */
export class RedisFailover extends ApiObject {
  /**
   * Returns the apiVersion and kind for "RedisFailover"
   */
  public static readonly GVK: GroupVersionKind = {
    apiVersion: 'databases.spotahome.com/v1',
    kind: 'RedisFailover',
  }

  /**
   * Renders a Kubernetes manifest for "RedisFailover".
   *
   * This can be used to inline resource manifests inside other objects (e.g. as templates).
   *
   * @param props initialization props
   */
  public static manifest(props: RedisFailoverProps = {}): any {
    return {
      ...RedisFailover.GVK,
      ...props,
    };
  }

  /**
   * Defines a "RedisFailover" API object
   * @param scope the scope in which to define this object
   * @param id a scope-local name for the object
   * @param props initialization props
   */
  public constructor(scope: Construct, id: string, props: RedisFailoverProps = {}) {
    super(scope, id, RedisFailover.manifest(props));
  }
}

/**
 * @schema RedisFailover
 */
export interface RedisFailoverProps {
}

