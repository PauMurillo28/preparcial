FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci


FROM node:18-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

RUN npm ci --omit=dev
ENV PORT=3000
EXPOSE 3000

COPY wait-for-backend.sh ./wait-for-backend.sh
RUN chmod +x ./wait-for-backend.sh

ENV BACKEND_URL="http://backend:8080/api/books" \
	START_COMMAND="npm start" \
	WAIT_TIMEOUT=40

CMD ["./wait-for-backend.sh"]
