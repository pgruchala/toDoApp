FROM node:23-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3004
CMD ["npm", "run", "projects"]