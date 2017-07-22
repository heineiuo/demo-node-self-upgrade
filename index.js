const express = require('express')
const npm = require('npm')
const uuid = require('uuid')


module.exports = module.exports.default = ({package}) =>  {

  const config = {
    upgrading: false,
    switch_version_log: []
  }

  const router = express.Router()

  router.get('/upgrade', async (req, res, next) => {

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
  

  router.get('/log', (req, res, next) => {
    if (!req.query.id) {
      return res.json({
        log: config.switch_version_log
      })
    }

    const target = config.switch_version_log.find(log => log.switch_version_log_id === req.query.id)
    res.json(!target ? {error: 'NotFoundError'} : target)
    
  })

  router.get('/', (req, res, next) => {
    res.json({
      name: package.name,
      version: package.version,
      description: package.description
    })
  })

  return router
}