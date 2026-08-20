# Unicorn Finance client - offline "Payments Garage" demo container.
# Tier 1 (default): builds the SPA and serves it statically. All four beats run
# offline via the in-browser MSW mock - no JPMorgan network or credentials.

# --- build stage ---
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# --- serve stage ---
FROM nginx:alpine AS serve
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
