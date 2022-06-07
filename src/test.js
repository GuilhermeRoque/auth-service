const yaml = require("js-yaml")
const fs = require('fs')
const freqPlans = yaml.load(fs.readFileSync('integrations/ttn/ttnFreqPlans.yml', 'utf8'))

console.log(freqPlans[0]["band-id"])