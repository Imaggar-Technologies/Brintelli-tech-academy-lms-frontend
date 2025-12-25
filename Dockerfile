# ===== Build stage =====
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm install

# FORCE install vite (guaranteed)
RUN npm install -g vite

# Copy source
COPY . .

# Build
RUN vite build

# ===== Run stage =====
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
