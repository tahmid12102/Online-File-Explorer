//Node modules
const http = require('http');

//File Imports
const respond = require('./lib/respond.js');

//Connection settings
const port = process.env.PORT || 3000;

//Create server
const server = http.createServer(respond);

//Listen to client requests on the specific port.
server.listen(port, () => console.log(`Listening on port: ${port}`));