FROM node:16-buster
WORKDIR /root
COPY package*.json ./
COPY access-token.key ./
COPY refresh-token.key ./
RUN npm ci
COPY ./src ./src
EXPOSE 3000
CMD ["node", "./src/server.js"]