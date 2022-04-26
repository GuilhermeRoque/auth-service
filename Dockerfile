FROM node:17-alpine3.14
WORKDIR /root
COPY package*.json ./
RUN npm ci
COPY ./src .
EXPOSE 3000
CMD ["node", "server.js"]