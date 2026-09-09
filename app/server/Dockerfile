# Unicorn Finance server - the express mTLS + signed-JWT proxy to real JPMorgan
# APIs. This is the Tier 2 ("++ real") path only: it needs client certificates
# mounted at ./certs and is NOT required for the offline mock demo.

FROM node:22-alpine
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
# development = read certs from the mounted ./certs rather than Secrets Manager.
# It does NOT enable verbose errors; set DEBUG_ERRORS=true for that (see .env.example).
ENV NODE_ENV=development
EXPOSE 8082
# app.local.js listens on :8082 and loads certs from ../certs (mounted).
CMD ["node", "app.local.js"]
