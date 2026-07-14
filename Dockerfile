FROM oven/bun:1.3 AS build
WORKDIR /app
COPY package.json bun.lock* ./
COPY packages/core/package.json packages/core/
COPY packages/telegram/package.json packages/telegram/
RUN bun install --frozen-lockfile || bun install
COPY . .
RUN bun run typecheck && bun test

FROM oven/bun:1.3-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app /app
# Telegram entry comes later; image builds core-ready
CMD ["bun", "--version"]
