# ===== BUILD STAGE =====
FROM node:20 AS builder

WORKDIR /app

# 🔒 HARD OVERRIDE — never skip devDependencies
ENV NODE_ENV=development
ENV NPM_CONFIG_PRODUCTION=false

COPY package.json package-lock.json ./

# 🔒 Use npm install (not npm ci) to FORCE dev deps
RUN npm install --no-audit --no-fund

# 🔍 VERIFY vite exists (this line is intentional)
RUN ls -la node_modules/.bin | grep vite

COPY . .

ENV NODE_OPTIONS=--max-old-space-size=4096

# 🔒 Run vite explicitly
RUN ./node_modules/.bin/vite build

# ===== RUN STAGE =====
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
