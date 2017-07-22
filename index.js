const argv = require('yargs').argv
const npm = require('npm')
const express = require('express')
const morgan = require('morgan')
const fs = require('fs')
const uuid = require('uuid')

const package = JSON.parse(fs.readFileSync(`${__dirname}/package.json`))

let pm2_id = null

let config = {
  upgrading: false,
  switch_version_log: []
}

console.log('app starting....')

process.on('message', (packet) => {
  const {id} = packet
  pm2_id = id
  process.send({
    type: 'process:msg',
    data: {
      success: true
    }
  });
});

const app = express()

app.use(morgan())

app.get('/switch_version', (req, res, next) => {

  const {version} = req.query
  if (version === package.version) return res.json({
    message: `Current version is ${version} too`
  })

  if (config.upgrading) return res.json({
    message: `Program is upgrading, please retry later`
  })
  config.upgrading = true

  npm.load({global: true}, (err) => {
    if (err) {
      config.upgrading = false
      return res.json({error: 'NpmError', message: 'An error occurred before npm install, maybe you have to manually upgrade'})
    }

    const switch_version_log_id = uuid.v1()

    res.json({
      switch_version_log_id,
      message: `Program is upgrading, it will auto restart after upgrade success, if failed, you can find fail log use 'switch_version_log_id'`
    })

    npm.commands.install([`${package.name}@${version}`], (err) => {
      if (err) {
        config.upgrading = false
        config.switch_version_log.unshift({
          switch_version_log_id,
          time: new Date(),
          error: err
        })
        if (config.switch_version_log.length > 100) config.switch_version_log.pop()
        return null
      }
      process.exit(0)
    })
  })
})

app.get('/switch_version/log', (req, res, next) => {
  if (!req.query.id) {
    return res.json({
      log: config.switch_version_log
    })
  }

  const target = config.switch_version_log.find(log => log.switch_version_log_id === req.query.id)
  res.json(!target ? {error: 'NotFoundError'} : target)
  
})

app.get('/pm2_id', (req, res, next) => {
  res.json({pm2_id})
})

app.get('/version', (req, res, next) => {
  res.json({version: package.version})
})

app.listen(8080, () => console.log(`start on port ${8080}`))