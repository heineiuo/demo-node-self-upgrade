# node-upgrade

======= 

It's an example shows how to upgrade node.js app which published with npm and deploy/manage with pm2.

### demo

first run commands:

```
# npm install node-upgrade@0.1.21 -g
# npm config get prefix # got a PATH
# pm2 start PATH/lib/node_modules/node-upgrade/example.js
```

then view http://127.0.0.1:8080/version to see version,
use  http://127.0.0.1:8080/version/upgrade?version=0.1.22 to upgrade version to 0.1.22, 
use  http://127.0.0.1:8080/version/log to view failed upgrade logs

more detail please read code :p

### useage

How to use in your own app？ just see the `example.js` code.

### license
MIT