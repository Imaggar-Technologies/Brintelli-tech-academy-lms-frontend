# ===== BUILD STAGE =====
FROM node:20 AS builder

WORKDIR /app

# Copy dependency files first (cache friendly)
COPY package.json package-lock.json ./
RUN npm ci --include=dev --prefer-offline --no-audit

# Copy source code
COPY . .

# Increase memory for Vite build
ENV NODE_OPTIONS=--max-old-space-size=4096

# Build the app
RUN npm run build

# ===== RUN STAGE =====
FROM nginx:alpine

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
