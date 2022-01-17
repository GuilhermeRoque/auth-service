const swaggerAutogen = require('swagger-autogen')()

const outputFile = './src/doc/swagger_output.json'
const endpointsFiles = ['./src/app.js']

// swaggerAutogen(outputFile, endpointsFiles)


// Para que o swagger_output.json seja gerado toda vez que iniciar o projeto (comentar no caso a linha acima de descomentar as abaixo)
swaggerAutogen(outputFile, endpointsFiles).then(() => {
    require('./index.js')
})