# syntax=docker/dockerfile:1
FROM node:20-alpine
WORKDIR /app
# Install deps first for better layer caching
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm ci || npm install --no-audit --no-fund
# Copy source
COPY . .
ENV NODE_ENV=production PORT=4000
EXPOSE 4000
CMD ["node","chat_server.js"]
