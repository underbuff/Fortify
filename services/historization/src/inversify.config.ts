import "reflect-metadata";
import { Container } from "inversify";

import { HealthCheckable } from "@shared/services/healthCheck";

import { SecretsManager } from "@shared/services/secrets";
import { Secrets } from "./secrets";

import { PostgresConnector } from "@shared/connectors/postgres";
import { KafkaConnector } from "@shared/connectors/kafka";
import { RedisConnector } from "@shared/connectors/redis";
import { InfluxDBConnector } from "@shared/connectors/influxdb";
import { Connector } from "@shared/definitions/connector";

const container = new Container({ autoBindInjectable: true });

container.bind(Secrets).toSelf().inSingletonScope();
container.bind(SecretsManager).toService(Secrets);

container.bind(PostgresConnector).toSelf().inSingletonScope();
container.bind(KafkaConnector).toSelf().inSingletonScope();
container.bind(RedisConnector).toSelf().inSingletonScope();
container.bind(InfluxDBConnector).toSelf().inSingletonScope();

container.bind<Connector>("connector").toService(KafkaConnector);
container.bind<Connector>("connector").toService(PostgresConnector);
container.bind<Connector>("connector").toService(RedisConnector);
container.bind<Connector>("connector").toService(InfluxDBConnector);

container.bind<HealthCheckable>("healthCheck").toService(PostgresConnector);
container.bind<HealthCheckable>("healthCheck").toService(KafkaConnector);
container.bind<HealthCheckable>("healthCheck").toService(RedisConnector);
container.bind<HealthCheckable>("healthCheck").toService(InfluxDBConnector);

export { container };
