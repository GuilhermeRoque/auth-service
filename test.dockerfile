FROM node:17-alpine3.14
WORKDIR /root
COPY package*.json ./
COPY ./src ./src
RUN npm ci
EXPOSE 3000
CMD ["npm", "run", "start-dev"]