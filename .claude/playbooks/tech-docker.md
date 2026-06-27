## Conventions
- Docker latest stable. Specific image tags only — never :latest.
- Multi-stage builds: build stage separated from runtime stage.
- Non-root user in all production containers.
- Health checks on all long-running services.

## Dockerfile Best Practices
- Order layers from least to most frequently changing (dependencies before source code).
- Combine RUN commands to reduce layer count.
- .dockerignore: exclude node_modules, .git, .env, tests.
- COPY only what is needed for the runtime stage.

## Forbidden
- FORBIDDEN: running containers as root in production.
- FORBIDDEN: storing secrets in Dockerfile or docker-compose.yml.
- FORBIDDEN: `:latest` tag for production images or shared base images (including `COPY --from=image:latest`).
- FORBIDDEN: mounting .env files into containers — use Docker secrets or environment injection.
- FORBIDDEN: exposing database ports to the public network.
- FORBIDDEN: specifying a language/runtime version that does not exist (e.g., `golang:1.25` when latest stable is 1.24) — verify the latest stable version before writing the FROM line.

## Recommended Patterns
- docker-compose for local development and CI.
- Named volumes for persistent data.
- Internal Docker network: services communicate by service name.
- Read-only filesystem mounts where possible (:ro).
- Resource limits (memory, CPU) on production containers.

## Health Checks
- Every long-running service MUST have a HEALTHCHECK in the Dockerfile or a healthcheck in docker-compose.yml.
- API services: `curl -f http://localhost:PORT/health` or equivalent.
- Workers: process-level check appropriate for the workload.

## Entrypoint & Shell Scripts
- Quote all variable expansions: `"$VARIABLE"` — unquoted variables break on spaces.
- Use `exec` for the main process — ensures the process receives signals (SIGTERM for graceful shutdown).
- `sleep infinity` as PID 1 → does not handle signals. Use `exec tail -f /dev/null` or install `tini` as init.
- Set `set -e` at the top of entrypoint scripts — fail fast on errors.

## Dev Dockerfiles
- Even in dev, prefer adding a non-root USER when the base image allows it.
- Document why Docker socket is mounted (`# DooD: host Docker daemon`) and acknowledge the security implication.

## Security
- Use distroless or Alpine base images to minimize attack surface.
- Scan images for vulnerabilities: docker scout or trivy.
- Do not run privileged containers without documented justification.
- Keep base images updated.

## Common Pitfalls
- Build cache invalidation: COPY source code after installing dependencies.
- Signal handling: use exec form (CMD ["node", "app.js"]) not shell form.
- Volume permissions: file ownership mismatch between host and container.
- STACK documentation → must match actual docker-compose services. If a service is removed, update the doc.

## Korteks Environment — Docker-in-Docker

This project runs inside a Korteks container with a dedicated Docker daemon (DinD sidecar).

- `DOCKER_HOST` is pre-configured — `docker` and `docker compose` work out of the box.
- Services started via `docker compose up` are accessible at hostname `docker`, not `localhost`.
- Example: `postgresql://user:pass@docker:5432/mydb`
- The Docker storage volume is limited to 10 GB — avoid pulling unnecessary images.
- Always clean up stopped containers and unused images (`docker system prune`) when disk is tight.
