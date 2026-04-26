FROM node:22-slim AS base
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm@9

WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/db/ packages/db/
COPY packages/queue/package.json packages/queue/
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile

COPY packages/queue packages/queue
COPY apps/api apps/api

ENV NODE_ENV=production
EXPOSE 8080
CMD ["pnpm", "--filter", "@pinmy/api", "start"]
