FROM node:22-alpine AS build
WORKDIR /app
ARG NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/.next ./.next
COPY --from=build /app/next.config.mjs ./
EXPOSE 3000
CMD ["npm", "start"]
