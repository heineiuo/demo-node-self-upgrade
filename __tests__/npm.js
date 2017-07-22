const npm = require('npm')

npm.load({global: true}, (err, a,b,c) => {
  npm.commands.install([`node-upgrade@0.1.14`], (err, a, b, c) => {
    console.log(err, a, b, c)
    process.exit(0)
  })
})