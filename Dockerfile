# ---- build stage ----
FROM node:22.22.2-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- runtime stage ----
FROM node:22.22.2-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
USER 1001
EXPOSE 6004
CMD ["sh", "-c", "exec node dist/app.js --port 6004"]
