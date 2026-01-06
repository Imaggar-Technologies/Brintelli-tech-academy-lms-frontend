# ===== BUILD STAGE =====
FROM node:20 AS builder

WORKDIR /app

# 🔑 FORCE devDependencies (do NOT rely on defaults)
ENV NODE_ENV=development
ENV npm_config_production=false

COPY package.json package-lock.json ./
RUN npm ci --prefer-offline --no-audit

COPY . .

ENV NODE_OPTIONS=--max-old-space-size=4096

# 🔑 Use npx so vite is resolved explicitly
RUN npx vite build

# ===== RUN STAGE =====
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
