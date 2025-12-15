FROM node:18-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./

RUN if [ -f pnpm-lock.yaml ]; then \
      pnpm install --frozen-lockfile --prod; \
    else \
      pnpm install --prod; \
    fi

FROM node:18-alpine

RUN apk add --no-cache tini

RUN npm install -g pnpm

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY . .

RUN chown -R node:node /app
USER node

EXPOSE 4000

ENTRYPOINT ["/sbin/tini", "--"]

CMD ["node", "src/index.js"]