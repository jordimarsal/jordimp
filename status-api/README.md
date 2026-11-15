# Status API

Real-time monitoring service for llama.cpp and Strata engines.

## Local Development
Run via Maven:
```bash
mvn spring-boot:run
```

## Deployment
Run via Docker Compose:
```bash
docker compose up -d --build
```

### Cloudflare Tunnel Configuration (Manual Step)
To expose this service publicly at `api.jordimp.net/status`:
1. Open your **Cloudflare Dashboard**.
2. Navigate to **Zero Trust** -> **Networks** -> **Tunnels**.
3. Edit your existing tunnel.
4. Add a **Public Hostname**:
   - **Public Hostname**: `api.jordimp.net`
   - **Path**: `/status*`
   - **Service Type**: `HTTP`
   - **URL**: `localhost:8081`

## API Endpoints
- `GET /api/status`: Current snapshot (JSON).
- `GET /api/status/stream`: SSE stream of updates.
- `GET /api/health`: Liveness probe.

## Configuration (`app.*`)
| Property | Description | Default |
|---|---|---|
| `app.probe-timeout-ms` | Timeout for engine probes | 1000 |
| `app.sse-heartbeat-seconds` | Interval for SSE heartbeats | 15 |
| `app.rate-limit-requests-per-minute` | Max requests per IP per minute | 60 |
| `app.cors-allowed-origins` | Comma-separated list of allowed origins | jordimp.net, localhost:4321 |

## Testing
Container health is verified via the `/api/health` endpoint. Note that container tests require a running Docker daemon.

## Scoreboard data (F26)

The pool file is mounted read-only into the container and the app reads it
through `APP_POOL_PATH=/data/pool/pool.jsonl` (set in docker-compose.yml):

```
~/ia/llama/ggufbench/results/models -> /data/pool (ro)
```

`FleetService` re-reads when the file's mtime changes; `global` is computed per
SPEC §5 (tools·0.30 + code·0.30 + agent·0.25 + speed·0.15, speed normalized
against the pool max, unmeasured = 0). Rows without `ts` show the file mtime —
never a fabricated date.
