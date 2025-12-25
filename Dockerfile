# ===== Build stage =====
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm install

# Install vite explicitly
RUN npm install -g vite

# Copy source
COPY . .

# Increase memory for large build
ENV NODE_OPTIONS=--max-old-space-size=2048

# Build
RUN vite build

# ===== Run stage =====
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
