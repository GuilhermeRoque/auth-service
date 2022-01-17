const swaggerAutogen = require('swagger-autogen')()

const outputFile = './src/doc/swagger_output.json'
const app = ['./src/app.js']

swaggerAutogen(outputFile, app)


// Para que o swagger_output.json seja gerado toda vez que iniciar o projeto (comentar no caso a linha acima de descomentar as abaixo)
// swaggerAutogen(outputFile, endpointsFiles).then(() => {
//     require('./index.js')
// })