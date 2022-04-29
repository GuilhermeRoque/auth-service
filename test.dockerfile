FROM node:17-alpine3.14
WORKDIR /root
COPY package*.json ./
COPY ./src ./src
ENV GEN_SECRET="45d239dd6d20d8e4c5919079a40e5ea6cf8d9ab0"
ENV TOKEN_EXPIRATION_TIME="15m"
ENV PRIVATE_KEY="private.key"
ENV PUBLIC_KEY="public.pem"
RUN npm ci
EXPOSE 3000
RUN ["npm", "run", "create-keys"]
CMD ["npm", "run", "start-dev"]