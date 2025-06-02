FROM node:23-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN mkdir -p prisma
COPY prisma/schema.prisma ./prisma/schema.prisma
RUN npx prisma generate
COPY entrypoint.sh ./entrypoint.sh
COPY . .
EXPOSE 3002
ENTRYPOINT ["sh", "./entrypoint.sh"]
CMD ["npm","run","users"]