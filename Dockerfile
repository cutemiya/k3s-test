# # FROM node:18-alpine

# # WORKDIR /app

# # # Копируем package файлы
# # COPY package*.json ./

# # # Устанавливаем зависимости с legacy-peer-deps
# # RUN npm install --legacy-peer-deps

# # COPY . .

# # EXPOSE 4000

# # CMD ["npm", "start"]
# # Stage 1: Build
# FROM node:18-alpine AS builder

# WORKDIR /app

# # Копируем package файлы
# COPY package*.json ./

# # Устанавливаем зависимости
# RUN npm ci --only=production

# # Stage 2: Runtime
# FROM node:18-alpine

# WORKDIR /app

# # Устанавливаем tini для корректной обработки сигналов в k8s
# RUN apk add --no-cache tini

# # Копируем зависимости и приложение из builder
# COPY --from=builder /app/node_modules ./node_modules
# COPY . .

# # Создаем пользователя node для безопасности
# RUN chown -R node:node /app
# USER node

# # Добавляем health check
# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#   CMD node -e "require('http').get('http://localhost:4000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# EXPOSE 4000

# # Используем tini как entrypoint
# ENTRYPOINT ["/sbin/tini", "--"]

# CMD ["node", "src/index.js"]
# Stage 1: Builder с pnpm
FROM node:18-alpine AS builder

# Устанавливаем pnpm глобально
RUN npm install -g pnpm

WORKDIR /app

# Копируем package файлы
COPY package.json pnpm-lock.yaml* ./

# Устанавливаем production зависимости
# Если нет pnpm-lock.yaml, создадим его
RUN if [ -f pnpm-lock.yaml ]; then \
      pnpm install --frozen-lockfile --prod; \
    else \
      pnpm install --prod; \
    fi

# Stage 2: Runtime
FROM node:18-alpine

# Устанавливаем tini для корректной обработки сигналов в k8s
RUN apk add --no-cache tini

# Устанавливаем pnpm для runtime (опционально, нужно только если требуется pnpm в runtime)
RUN npm install -g pnpm

WORKDIR /app

# Копируем зависимости и приложение из builder
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Создаем пользователя node для безопасности
RUN chown -R node:node /app
USER node

# Добавляем health check
# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  # CMD node -e "require('http').get('http://localhost:4000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

EXPOSE 4000

# Используем tini как entrypoint
ENTRYPOINT ["/sbin/tini", "--"]

CMD ["node", "src/index.js"]