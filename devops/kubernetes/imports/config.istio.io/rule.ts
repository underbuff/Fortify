// generated by cdk8s
import { ApiObject } from 'cdk8s';
import { Construct } from 'constructs';

/**
 * 
 *
 * @schema rule
 */
export class rule extends ApiObject {
  /**
   * Defines a "rule" API object
   * @param scope the scope in which to define this object
   * @param name a scope-local name for the object
   * @param options configuration options
   */
  public constructor(scope: Construct, name: string, options: ruleOptions = {}) {
    super(scope, name, {
      ...options,
      kind: 'rule',
      apiVersion: 'config.istio.io/v1alpha2',
    });
  }
}

/**
 * @schema rule
 */
export interface ruleOptions {
  /**
   * Describes the rules used to configure Mixer's policy and telemetry features. See more details at: https://istio.io/docs/reference/config/policy-and-telemetry/istio.policy.v1beta1.html
   *
   * @schema rule#spec
   */
  readonly spec?: RuleSpec;

}

/**
 * Describes the rules used to configure Mixer's policy and telemetry features. See more details at: https://istio.io/docs/reference/config/policy-and-telemetry/istio.policy.v1beta1.html
 *
 * @schema RuleSpec
 */
export interface RuleSpec {
  /**
   * The actions that will be executed when match evaluates to `true`.
   *
   * @schema RuleSpec#actions
   */
  readonly actions?: RuleSpecActions[];

  /**
   * Match is an attribute based predicate.
   *
   * @schema RuleSpec#match
   */
  readonly match?: string;

  /**
   * @schema RuleSpec#requestHeaderOperations
   */
  readonly requestHeaderOperations?: RuleSpecRequestHeaderOperations[];

  /**
   * @schema RuleSpec#responseHeaderOperations
   */
  readonly responseHeaderOperations?: RuleSpecResponseHeaderOperations[];

  /**
   * @schema RuleSpec#sampling
   */
  readonly sampling?: RuleSpecSampling;

}

/**
 * @schema RuleSpecActions
 */
export interface RuleSpecActions {
  /**
   * Fully qualified name of the handler to invoke.
   *
   * @schema RuleSpecActions#handler
   */
  readonly handler?: string;

  /**
   * @schema RuleSpecActions#instances
   */
  readonly instances?: string[];

  /**
   * A handle to refer to the results of the action.
   *
   * @schema RuleSpecActions#name
   */
  readonly name?: string;

}

/**
 * @schema RuleSpecRequestHeaderOperations
 */
export interface RuleSpecRequestHeaderOperations {
  /**
   * Header name literal value.
   *
   * @schema RuleSpecRequestHeaderOperations#name
   */
  readonly name?: string;

  /**
   * Header operation type.
   *
   * @schema RuleSpecRequestHeaderOperations#operation
   */
  readonly operation?: RuleSpecRequestHeaderOperationsOperation;

  /**
   * Header value expressions.
   *
   * @schema RuleSpecRequestHeaderOperations#values
   */
  readonly values?: string[];

}

/**
 * @schema RuleSpecResponseHeaderOperations
 */
export interface RuleSpecResponseHeaderOperations {
  /**
   * Header name literal value.
   *
   * @schema RuleSpecResponseHeaderOperations#name
   */
  readonly name?: string;

  /**
   * Header operation type.
   *
   * @schema RuleSpecResponseHeaderOperations#operation
   */
  readonly operation?: RuleSpecResponseHeaderOperationsOperation;

  /**
   * Header value expressions.
   *
   * @schema RuleSpecResponseHeaderOperations#values
   */
  readonly values?: string[];

}

/**
 * @schema RuleSpecSampling
 */
export interface RuleSpecSampling {
  /**
   * Provides filtering of actions based on random selection per request.
   *
   * @schema RuleSpecSampling#random
   */
  readonly random?: RuleSpecSamplingRandom;

  /**
   * @schema RuleSpecSampling#rateLimit
   */
  readonly rateLimit?: RuleSpecSamplingRateLimit;

}

/**
 * Header operation type.
 *
 * @schema RuleSpecRequestHeaderOperationsOperation
 */
export enum RuleSpecRequestHeaderOperationsOperation {
  /** REPLACE */
  REPLACE = "REPLACE",
  /** REMOVE */
  REMOVE = "REMOVE",
  /** APPEND */
  APPEND = "APPEND",
}

/**
 * Header operation type.
 *
 * @schema RuleSpecResponseHeaderOperationsOperation
 */
export enum RuleSpecResponseHeaderOperationsOperation {
  /** REPLACE */
  REPLACE = "REPLACE",
  /** REMOVE */
  REMOVE = "REMOVE",
  /** APPEND */
  APPEND = "APPEND",
}

/**
 * Provides filtering of actions based on random selection per request.
 *
 * @schema RuleSpecSamplingRandom
 */
export interface RuleSpecSamplingRandom {
  /**
   * Specifies an attribute expression to use to override the numerator in the `percent_sampled` field.
   *
   * @schema RuleSpecSamplingRandom#attributeExpression
   */
  readonly attributeExpression?: string;

  /**
   * The default sampling rate, expressed as a percentage.
   *
   * @schema RuleSpecSamplingRandom#percentSampled
   */
  readonly percentSampled?: RuleSpecSamplingRandomPercentSampled;

  /**
   * By default sampling will be based on the value of the request header `x-request-id`.
   *
   * @schema RuleSpecSamplingRandom#useIndependentRandomness
   */
  readonly useIndependentRandomness?: boolean;

}

/**
 * @schema RuleSpecSamplingRateLimit
 */
export interface RuleSpecSamplingRateLimit {
  /**
   * Number of entries to allow during the `sampling_duration` before sampling is enforced.
   *
   * @schema RuleSpecSamplingRateLimit#maxUnsampledEntries
   */
  readonly maxUnsampledEntries?: number;

  /**
   * Window in which to enforce the sampling rate.
   *
   * @schema RuleSpecSamplingRateLimit#samplingDuration
   */
  readonly samplingDuration?: string;

  /**
   * The rate at which to sample entries once the unsampled limit has been reached.
   *
   * @schema RuleSpecSamplingRateLimit#samplingRate
   */
  readonly samplingRate?: number;

}

/**
 * The default sampling rate, expressed as a percentage.
 *
 * @schema RuleSpecSamplingRandomPercentSampled
 */
export interface RuleSpecSamplingRandomPercentSampled {
  /**
   * Specifies the denominator.
   *
   * @schema RuleSpecSamplingRandomPercentSampled#denominator
   */
  readonly denominator?: RuleSpecSamplingRandomPercentSampledDenominator;

  /**
   * Specifies the numerator.
   *
   * @schema RuleSpecSamplingRandomPercentSampled#numerator
   */
  readonly numerator?: number;

}

/**
 * Specifies the denominator.
 *
 * @schema RuleSpecSamplingRandomPercentSampledDenominator
 */
export enum RuleSpecSamplingRandomPercentSampledDenominator {
  /** HUNDRED */
  HUNDRED = "HUNDRED",
  /** TEN_THOUSAND */
  TEN_THOUSAND = "TEN_THOUSAND",
}
