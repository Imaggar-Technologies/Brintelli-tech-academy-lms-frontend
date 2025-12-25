# ===== Build stage =====
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies (INCLUDING devDependencies)
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# ===== Run stage =====
FROM nginx:alpine

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built frontend from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
