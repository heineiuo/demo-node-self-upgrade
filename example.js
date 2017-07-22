const express = require('express')
const morgan = require('morgan')
const switchVersion = require('./')
const fs = require('fs')

const package = JSON.parse(fs.readFileSync(`${__dirname}/package.json`))

const app = express()

app.use(morgan())

app.use('/version', switchVersion({
  package
}))

app.listen(8080, () => console.log(`start on port ${8080}`))