# ===== BUILD STAGE =====
FROM node:20 AS builder

WORKDIR /app

# 🔒 FORCE devDependencies (CRITICAL)
ENV NODE_ENV=development
ENV NPM_CONFIG_PRODUCTION=false

COPY package.json package-lock.json ./

# ✅ npm ci is fine AFTER forcing dev deps
RUN npm ci

COPY . .

ENV NODE_OPTIONS=--max-old-space-size=4096

# ✅ npm script uses local vite
RUN npm run build

# ===== RUN STAGE =====
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
