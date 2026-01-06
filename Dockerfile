FROM oven/bun:1 AS builder

WORKDIR /app

COPY bun.lock package.json ./
RUN bun install

COPY . .
RUN bun run build

FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
