# ===== BUILD STAGE =====
FROM node:20 AS builder

WORKDIR /app

# 🔑 Force devDependencies to install
ENV NODE_ENV=development

COPY package.json package-lock.json ./

# ✅ Correct install for CI
RUN npm ci --include=dev

COPY . .

# ✅ Use npm script (npx handles vite correctly)
RUN npm run build

# ===== RUN STAGE =====
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
