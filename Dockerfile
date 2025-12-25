# ===== Build stage =====
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm install -g vite

COPY . .
ENV NODE_OPTIONS=--max-old-space-size=2048
RUN vite build

# ===== Run stage =====
FROM nginx:alpine

# REMOVE DEFAULT NGINX CONFIG
RUN rm /etc/nginx/conf.d/default.conf

# COPY SPA NGINX CONFIG
COPY nginx.conf /etc/nginx/conf.d/default.conf

# COPY BUILD FILES
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
