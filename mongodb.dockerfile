FROM mongo:5.0-focal
ENV MONGO_INITDB_ROOT_USERNAME="myUserAdmin"
ENV MONGO_INITDB_ROOT_PASSWORD="password"
EXPOSE 27017
CMD ["mongod"]

# Build example
# docker build -t mongodbTeste -f mongodb.dockerfile .

# Run example
# docker run -d -p 27017:27017 --name mongodb mongodb