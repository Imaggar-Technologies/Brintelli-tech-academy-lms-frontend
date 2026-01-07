# ===== BUILD STAGE =====
FROM node:20 AS builder

WORKDIR /app

# 🔒 Force devDependencies
ENV NODE_ENV=development

COPY package.json package-lock.json ./

# ✅ THIS IS THE KEY LINE (DO NOT USE npm ci)
RUN npm install --no-audit --no-fund

COPY . .

ENV NODE_OPTIONS=--max-old-space-size=4096

# ✅ vite WILL exist now
RUN npm run build

# ===== RUN STAGE =====
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
    