import { config } from "dotenv";
config();

import { Construct } from "constructs";
import { App, Chart } from "cdk8s";

import {
	Gateway,
	GatewayOptions,
	GatewaySpecServersTlsMode,
} from "./imports/networking.istio.io/gateway";

import { FortifyDeployment } from "./src/deployment";
import { WebService } from "./src/webservice";
import { Certificate } from "./imports/cert-manager.io/certificate";
import {
	Secret,
	ObjectMeta,
	Namespace,
	ConfigMap,
	ServiceAccount,
	ClusterRole,
	ClusterRoleBinding,
	DaemonSet,
} from "./imports/k8s";
import {
	Kafka,
	KafkaSpecKafkaStorageType,
	KafkaSpecKafkaStorageVolumesType,
	KafkaSpecZookeeperStorageType,
	KafkaOptions,
} from "./imports/kafka.strimzi.io/kafka";
import { Postgres } from "./imports/kubedb.com/postgres";
import { RedisCommander } from "./src/redis-commander";

import backendPackage from "../../services/backend/package.json";
import frontendPackage from "../../services/frontend/package.json";
import fsmPackage from "../../services/fsm/package.json";
import gsiReceiverPackage from "../../services/gsi-receiver/package.json";
import twitchBotPackage from "../../services/17kmmrbot/package.json";
import jobsPackage from "../../services/jobs/package.json";
import {
	KafkaTopic,
	KafkaTopicOptions,
} from "./imports/kafka.strimzi.io/kafkatopic";
import { FortifyCronJob } from "./src/cronjob";
import { RedisFailover } from "./imports/databases.spotahome.com/redisfailover";
import { Elasticsearch } from "./imports/elasticsearch.k8s.elastic.co/elasticsearch";
import { Kibana } from "./imports/kibana.k8s.elastic.co/kibana";
import { kubernetesConf } from "./src/fluentd/config";

export interface CustomGatewayOptions extends GatewayOptions {
	metadata?: ObjectMeta;
}

export interface CustomKafkaOptions extends KafkaOptions {
	metadata?: ObjectMeta;
}

export interface CustomKafkaTopicOptions extends KafkaTopicOptions {
	metadata?: ObjectMeta;
}

const { JWT_SECRET, OAUTH_TOKEN, DOMAIN = "fortify.gg" } = process.env;

export class ClusterSetup extends Chart {
	constructor(scope: Construct, name: string) {
		super(scope, name, { namespace: "fortify" });

		new Namespace(this, "fortify-namespace", {
			metadata: {
				name: "fortify",
				namespace: undefined,
				labels: {
					"istio-injection": "enabled",
				},
			},
		});

		// --- Kafka setup ---

		new Kafka(this, "kafka", {
			metadata: {
				name: "fortify",
				namespace: "kafka",
			},
			spec: {
				kafka: {
					version: "2.5.0",
					replicas: 3,
					listeners: {
						plain: {},
						tls: {},
					},
					config: {
						"offsets.topic.replication.factor": 1,
						"transaction.state.log.replication.factor": 1,
						"transaction.state.log.min.isr": 1,
						"log.message.format.version": "2.5",
					},
					storage: {
						type: KafkaSpecKafkaStorageType.JBOD,
						volumes: [
							{
								id: 0,
								type:
									KafkaSpecKafkaStorageVolumesType.PERSISTENT_CLAIM,
								size: "100Gi",
								deleteClaim: false,
							},
						],
					},
				},
				zookeeper: {
					replicas: 3,
					storage: {
						type: KafkaSpecZookeeperStorageType.PERSISTENT_CLAIM,
						size: "100Gi",
						deleteClaim: false,
					},
					template: {
						pod: {
							metadata: {
								annotations: {
									"sidecar.istio.io/inject": false,
								},
							},
						},
					},
				},
				entityOperator: {
					topicOperator: {},
				},
			},
		} as CustomKafkaOptions);

		new KafkaTopic(this, "gsi-topic", {
			metadata: {
				name: "gsi",
				namespace: "kafka",
				labels: {
					"strimzi.io/cluster": "fortify",
				},
			},
			spec: {
				partitions: 1,
				replicas: 1,
				config: {
					"retention.ms": 7 * 86400000, // 7 * 1 day,
					"segment.ms": 86400000, // 1 day
					"segment.bytes": 1073741824, // 1 GB
				},
			},
		} as CustomKafkaTopicOptions);

		// --- Postgres setup ---

		new Namespace(this, "postgres-namespace", {
			metadata: {
				name: "postgres",
				namespace: undefined,
				labels: {
					"istio-injection": "enabled",
				},
			},
		});

		new Postgres(this, "postgres", {
			metadata: {
				name: "postgres",
				namespace: "postgres",
			},
			spec: {
				version: "11.2",
				replicas: 3,
				storageType: "Durable",
				storage: {
					storageClassName: "longhorn",
					accessModes: ["ReadWriteOnce"],
					resources: {
						requests: {
							storage: "10Gi",
						},
					},
				},
			},
		});

		// --- Redis setup ---

		new Namespace(this, "redis-namespace", {
			metadata: {
				name: "redis",
				namespace: undefined,
				labels: {
					"istio-injection": "enabled",
				},
			},
		});

		new RedisFailover(this, "redis", {
			metadata: {
				name: "redis",
				namespace: "redis",
			},
			spec: {
				sentinel: {
					replicas: 3,
				},
				redis: {
					replicas: 3,
					storage: {
						keepAfterDeletion: true,
						persistentVolumeClaim: {
							metadata: {
								name: "redisfailover-persistent-keep-data",
							},
							spec: {
								accessModes: ["ReadWriteOnce"],
								resources: {
									requests: {
										storage: "10Gi",
									},
								},
							},
						},
					},
				},
			},
		});

		new RedisCommander(this, "redis-commander", {
			SENTINEL_HOST: "rfs-redis.redis",
			SENTINEL_PORT: "26379",
		});

		new Namespace(this, "logs-namespace", {
			metadata: {
				name: "logs",
				namespace: undefined,
				labels: {
					"istio-injection": "enabled",
				},
			},
		});

		// --- ElasticSearch setup ---

		new Elasticsearch(this, "elasticsearch", {
			metadata: {
				name: "elasticsearch",
				namespace: "logs",
			},
			spec: {
				version: "7.8.1",
				http: {
					tls: {
						selfSignedCertificate: {
							disabled: true,
						},
					},
				},
				nodeSets: [
					{
						name: "default",
						count: 3,
						config: {
							"node.master": true,
							"node.data": true,
							"node.ingest": true,
						},
						podTemplate: {
							metadata: {
								annotations: {
									"traffic.sidecar.istio.io/includeInboundPorts":
										"*",
									"traffic.sidecar.istio.io/excludeOutboundPorts":
										"9300",
									"traffic.sidecar.istio.io/excludeInboundPorts":
										"9300",
								},
							},
							spec: {
								automountServiceAccountToken: true,
								initContainers: [
									{
										name: "sysctl",
										securityContext: {
											privileged: true,
										},
										command: [
											"sh",
											"-c",
											"sysctl -w vm.max_map_count=262144",
										],
									},
								],
							},
						},
						volumeClaimTemplates: [
							{
								metadata: {
									name: "elasticsearch-data",
								},
								spec: {
									accessModes: ["ReadWriteOnce"],
									resources: {
										requests: {
											storage: "100Gi",
										},
									},
								},
							},
						],
					},
				],
			},
		});

		new Kibana(this, "kibana", {
			metadata: {
				name: "kibana",
				namespace: "logs",
			},
			spec: {
				version: "7.8.1",
				count: 1,
				elasticsearchRef: {
					name: "elasticsearch",
				},
			},
		});

		// --- Fluentd setup ---

		new ServiceAccount(this, "fluentd-service-account", {
			metadata: {
				name: "fluentd",
				namespace: "logs",
			},
		});

		new ClusterRole(this, "fluentd-cluster-role", {
			metadata: {
				name: "fluentd",
				namespace: "logs",
			},
			rules: [
				{
					apiGroups: [""],
					resources: ["pods", "namespaces"],
					verbs: ["get", "list", "watch"],
				},
			],
		});

		new ClusterRoleBinding(this, "fluentd-cluster-role-binding", {
			metadata: {
				name: "fluentd",
			},
			roleRef: {
				kind: "ClusterRole",
				name: "fluentd",
				apiGroup: "rbac.authorization.k8s.io",
			},
			subjects: [
				{
					kind: "ServiceAccount",
					name: "fluentd",
					namespace: "logs",
				},
			],
		});

		new ConfigMap(this, "fluentd-config", {
			metadata: {
				name: "fluentd-kubernetes-conf",
				namespace: "logs",
			},
			data: {
				"kubernetes.conf": kubernetesConf,
			},
		});

		const fluentDsLabels = {
			"k8s-app": "fluentd-logging",
			version: "v1",
		};

		new DaemonSet(this, "fluentd-ds", {
			metadata: {
				name: "fluentd",
				namespace: "logs",
				labels: fluentDsLabels,
			},
			spec: {
				selector: {
					matchLabels: fluentDsLabels,
				},
				template: {
					metadata: {
						labels: fluentDsLabels,
						annotations: {
							"sidecar.istio.io/inject": "false",
						},
					},
					spec: {
						serviceAccount: "fluentd",
						serviceAccountName: "fluentd",
						tolerations: [
							{
								key: "node-role.kubernetes.io/master",
								effect: "NoSchedule",
							},
						],
						containers: [
							{
								name: "fluentd",
								image:
									"fluent/fluentd-kubernetes-daemonset:v1-debian-elasticsearch",
								env: [
									{
										name: "FLUENT_ELASTICSEARCH_HOST",
										value: "elasticsearch-es-http",
									},
									{
										name: "FLUENT_ELASTICSEARCH_PORT",
										value: "9200",
									},
									{
										name: "FLUENT_ELASTICSEARCH_SCHEME",
										value: "http",
									},
									// Option to configure elasticsearch plugin with self signed certs
									{
										name: "FLUENT_ELASTICSEARCH_SSL_VERIFY",
										value: "true",
									},
									// Option to configure elasticsearch plugin with tls
									{
										name:
											"FLUENT_ELASTICSEARCH_SSL_VERSION",
										value: "TLSv1_2",
									},
									// X-Pack Authentication
									{
										name: "FLUENT_ELASTICSEARCH_USER",
										value: "elastic",
									},
									{
										name: "FLUENT_ELASTICSEARCH_PASSWORD",
										valueFrom: {
											secretKeyRef: {
												key: "elastic",
												name:
													"elasticsearch-es-elastic-user",
											},
										},
									},
									// Containerd logs format
									{
										name:
											"FLUENT_CONTAINER_TAIL_PARSER_TYPE",
										value:
											"/^(?<time>.+) (?<stream>stdout|stderr) (?<logtag>[FP]) (?<log>.+)$/",
									},
									{
										name:
											"FLUENT_CONTAINER_TAIL_EXCLUDE_PATH",
										value: `["/var/log/containers/fluentd-*"]`,
									},
								],
								resources: {
									limits: {
										memory: "200Mi",
									},
									requests: {
										cpu: "100m",
										memory: "200Mi",
									},
								},
								volumeMounts: [
									{
										name: "varlog",
										mountPath: "/var/log",
									},
									{
										name: "varlibdockercontainers",
										mountPath: "/var/lib/docker/containers",
										readOnly: true,
									},
									{
										name: "config",
										mountPath:
											"/fluentd/etc/kubernetes.conf",
										subPath: "kubernetes.conf",
									},
								],
							},
						],
						terminationGracePeriodSeconds: 30,
						volumes: [
							{
								name: "varlog",
								hostPath: {
									path: "/var/log",
								},
							},
							{
								name: "varlibdockercontainers",
								hostPath: {
									path: "/var/lib/docker/containers",
								},
							},
							{
								name: "config",
								configMap: {
									name: "fluentd-kubernetes-conf",
								},
							},
						],
					},
				},
			},
		});
	}
}

export class Fortify extends Chart {
	constructor(scope: Construct, name: string) {
		super(scope, name, { namespace: "fortify" });

		// define resources here

		// TODO: Move this to vault, once vault is setup
		new Secret(this, "jwt-secret", {
			metadata: {
				name: "jwt-secret",
			},
			stringData: {
				JWT_SECRET: JWT_SECRET ?? "",
			},
		});

		new Secret(this, "twitch-bot-secret", {
			metadata: {
				name: "twitch-bot-secret",
			},
			stringData: {
				OAUTH_TOKEN: OAUTH_TOKEN ?? "",
			},
		});

		// Default env variables
		new ConfigMap(this, "kafka-config", {
			metadata: {
				name: "kafka-config",
			},
			data: {
				KAFKA_BROKERS: '["fortify-kafka-bootstrap.kafka:9092"]',
			},
		});

		new ConfigMap(this, "postgres-config", {
			metadata: {
				name: "postgres-config",
			},
			data: {
				POSTGRES_HOST: "postgres.postgres",
				POSTGRES_PORT: "5432",
				POSTGRES_DATABASE: "postgres",
			},
		});

		new ConfigMap(this, "redis-config", {
			metadata: {
				name: "redis-config",
			},
			data: {
				// REDIS_URL: "redis://redis.redis:6379",
				REDIS_SENTINEL: "rfs-redis.redis:26379",
				REDIS_SENTINEL_NAME: "mymaster",
			},
		});

		// TLS certificate requested via cert-manager
		new Certificate(this, "fortify-ssl-cert", {
			metadata: {
				name: "fortify-ssl-cert",
				namespace: "istio-system",
			},
			spec: {
				secretName: "fortify-ssl-cert",
				commonName: DOMAIN,
				dnsNames: [DOMAIN, `api.${DOMAIN}`, `gsi.${DOMAIN}`],
				issuerRef: {
					name: "cf-letsencrypt-staging",
					kind: "ClusterIssuer",
				},
			},
		});

		// Istio gateway
		new Gateway(this, "fortify-gateway", {
			metadata: {
				name: "fortify-gateway",
			},
			spec: {
				selector: {
					istio: "ingressgateway",
				},
				servers: [
					{
						port: {
							number: 443,
							name: "https",
							protocol: "HTTPS",
						},
						tls: {
							mode: GatewaySpecServersTlsMode.SIMPLE,
							credentialName: "fortify-ssl-cert",
						},
						hosts: [DOMAIN, `api.${DOMAIN}`, `gsi.${DOMAIN}`],
					},
				],
			},
		} as CustomGatewayOptions);

		// Fortify web services
		new WebService(this, "backend", {
			name: "backend",
			version: backendPackage.version,
			service: {
				name: "backend",
				containerPort: 8080,
				port: 8080,
				portName: "http-backend",
			},
			env: [
				{ name: "MY_PORT", value: "8080" },
				// TODO: Change this to production once access to gql ui is not needed anymore
				{ name: "NODE_ENV", value: "development" },
				{ name: "APP_URL", value: "https://api.fortify.gg" },
			],
			secrets: ["postgres-auth", "jwt-secret"],
			configmaps: ["postgres-config", "kafka-config"],
			gateways: ["fortify-gateway"],
			hosts: [`api.${DOMAIN}`],
			http: [
				{
					route: [
						{
							destination: {
								port: {
									number: 8080,
								},
								host: "backend",
							},
						},
					],
				},
			],
		});

		new WebService(this, "frontend", {
			name: "frontend",
			version: frontendPackage.version,
			env: [
				{
					name: "GRAPHQL_URI",
					value: "https://api.fortify.gg/graphql",
				},
				{
					name: "GRAPHQL_WS_URI",
					value: "wss://api.fortify.gg/graphql",
				},
			],
			service: {
				name: "frontend",
				containerPort: 3000,
				port: 3000,
				portName: "http-frontend",
			},
			gateways: ["fortify-gateway"],
			hosts: [DOMAIN],
			http: [
				{
					route: [
						{
							destination: {
								port: {
									number: 3000,
								},
								host: "frontend",
							},
						},
					],
				},
			],
		});

		new WebService(this, "gsi-receiver", {
			name: "gsi-receiver",
			version: gsiReceiverPackage.version,
			env: [
				{ name: "MY_PORT", value: "8080" },
				{
					name: "KAFKA_CLIENT_ID",
					valueFrom: { fieldRef: { fieldPath: "metadata.name" } },
				},
				{ name: "KAFKA_TOPIC", value: "gsi" },
			],
			secrets: ["jwt-secret"],
			configmaps: ["kafka-config"],
			service: {
				name: "gsi-receiver",
				containerPort: 8080,
				port: 8080,
				portName: "http-gsi-ingress",
			},
			gateways: ["fortify-gateway"],
			hosts: [`gsi.${DOMAIN}`],
			http: [
				{
					route: [
						{
							destination: {
								port: {
									number: 8080,
								},
								host: "gsi-receiver",
							},
						},
					],
				},
			],
		});

		// Deployments that are not exposed to the web
		new FortifyDeployment(this, "17kmmrbot", {
			name: "17kmmrbot",
			version: twitchBotPackage.version,
			env: [
				{ name: "BOT_USERNAME", value: "17kmmrbot" },
				{
					name: "KAFKA_CLIENT_ID",
					valueFrom: { fieldRef: { fieldPath: "metadata.name" } },
				},
				{ name: "KAFKA_TOPIC", value: "gsi" },
			],
			secrets: ["postgres-auth", "twitch-bot-secret"],
			configmaps: ["postgres-config", "redis-config", "kafka-config"],
		});

		new FortifyDeployment(this, "fsm", {
			name: "fsm",
			version: fsmPackage.version,
			env: [
				{
					name: "KAFKA_CLIENT_ID",
					valueFrom: { fieldRef: { fieldPath: "metadata.name" } },
				},
			],
			secrets: ["jwt-secret"],
			configmaps: ["redis-config", "kafka-config"],
		});

		// CronJobs
		new FortifyCronJob(this, "import-standard", {
			name: "import-standard",
			version: jobsPackage.version,

			schedule: "15 * * * *",
			script: "import",

			env: [
				{
					name: "LEADERBOARD_TYPE",
					value: "standard",
				},
				{
					name: "KAFKA_CLIENT_ID",
					valueFrom: { fieldRef: { fieldPath: "metadata.name" } },
				},
			],
			configmaps: ["redis-config", "kafka-config"],
		});
		new FortifyCronJob(this, "import-turbo", {
			name: "import-turbo",
			version: jobsPackage.version,

			schedule: "15 * * * *",
			script: "import",

			env: [
				{
					name: "LEADERBOARD_TYPE",
					value: "turbo",
				},
				{
					name: "KAFKA_CLIENT_ID",
					valueFrom: { fieldRef: { fieldPath: "metadata.name" } },
				},
			],
			configmaps: ["redis-config", "kafka-config"],
		});
		new FortifyCronJob(this, "import-duos", {
			name: "import-duos",
			version: jobsPackage.version,

			schedule: "15 * * * *",
			script: "import",

			env: [
				{
					name: "LEADERBOARD_TYPE",
					value: "duos",
				},
				{
					name: "KAFKA_CLIENT_ID",
					valueFrom: { fieldRef: { fieldPath: "metadata.name" } },
				},
			],
			configmaps: ["redis-config", "kafka-config"],
		});
	}
}

const app = new App();
new ClusterSetup(app, "cluster");
new Fortify(app, "fortify");
app.synth();
