const Hapi = require('hapi');
const config = require('config');
const pkg = require('./package');

const { host, port } = config.get('hapiServer');

const server = Hapi.server({ host, port });

server.route({
  method: 'GET',
  path: '/',
  handler: (request, h) => 'Hello, world, from ToDone-server!\n'
});

server.route({
  method: 'GET',
  path: '/{name}',
  handler: (request, h) => `Hello, ${request.params.name} from ToDone-server!\n`
});

server.route({
  method: 'GET',
  path: '/healthcheck',
  handler: (request, h) => ({ status: 'ok', service: 'ToDone-server', version: pkg.version })
});

async function start() {
  try {
    await server.start();
  }
  catch (err) {
    console.log(err);
    process.exit(1);
  }
  console.log(`Server running at ${server.info.uri}`);
}

start();
