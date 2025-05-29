FROM node:23-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
EXPOSE 3002
CMD ["sh", "-c", "npx prisma migrate deploy && npm run users"]