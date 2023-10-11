ARG BASE_VERSION=invalidVersion

FROM ghcr.io/underbuff/fortify/base:$BASE_VERSION AS builder
LABEL org.opencontainers.image.source https://github.com/underbuff/fortify

ARG SERVICE_NAME

# Copy the files necessary for the serivce
WORKDIR /usr/src/app/${SERVICE_NAME}
COPY services/${SERVICE_NAME} .

# Compile the service
RUN npm ci --silent &&\
	npm run compile &&\
	rm -rf src tests

# Multi stage build to reduce image size
FROM ghcr.io/underbuff/fortify/base:$BASE_VERSION
LABEL org.opencontainers.image.source https://github.com/underbuff/fortify

ARG SERVICE_NAME

WORKDIR /usr/src/app/${SERVICE_NAME}
COPY --from=builder /usr/src/app/${SERVICE_NAME}/build build
COPY --from=builder /usr/src/app/${SERVICE_NAME}/package.json .
COPY --from=builder /usr/src/app/${SERVICE_NAME}/package-lock.json .
COPY --from=builder /usr/src/app/${SERVICE_NAME}/tsconfig.json .

# Install only prod dependencies
RUN npm install --only=production

# Change file ownership inside of container
RUN chown -R node:node /usr/src/app
USER node

# Expose port
ARG EXPOSED_PORT=8080
EXPOSE ${EXPOSED_PORT}

CMD npm run start
