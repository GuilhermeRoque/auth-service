FROM node:17-alpine3.14
WORKDIR /root
COPY .env.sample .env
COPY . .
RUN npm ci
EXPOSE 3000
RUN ["npm", "run", "create-keys"]
CMD ["npm", "run", "start-dev"]