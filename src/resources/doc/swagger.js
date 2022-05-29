const swaggerAutogen = require('swagger-autogen')()

const outputFile = './src/doc/swagger_output.json'
const endpointsFiles = ['./src/app.js']

swaggerAutogen(outputFile, endpointsFiles)
// Uncomment these lines for starting server after doc is generated (and comment the line before)
// swaggerAutogen(outputFile, endpointsFiles).then(() => {
//     require('../server')           // Your project's root file
// })