FROM node:24 AS builder
WORKDIR /usr/local/app

RUN npm install -g pnpm

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package.json ./
COPY pnpm-lock.yaml ./
RUN pnpm install --ignore-scripts

COPY . ./
RUN pnpm build

FROM nginx:alpine

COPY --from=builder /usr/local/app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
