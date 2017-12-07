const Hapi = require('hapi');
const config = require('config');
const pkg = require('./package');
const es = require('elasticsearch');
const eb = require('elastic-builder');
const R = require('ramda');

const esClient = new es.Client({ host: config.get('elasticsearch').host });

const { host, port } = config.get('hapiServer');

const server = Hapi.server({ host, port });

const tasksApi = {
  name: 'tasksApi',
  version: '1.0.0',
  register: (server, options) => {
    server.route({
      method: 'GET',
      path: '/tasks',
      handler: (request, h) =>
        esClient.search({ index: 'todone-tasks', type: 'task' })
          .then(resp => R.map(item => item._source, resp.hits.hits))
    });

    server.route({
      method: 'GET',
      path: '/tasks/{id}',
      handler: (request, h) =>
        esClient.get({ index: 'todone-tasks', type: 'task', id: request.params.id })
          .then(resp => resp._source)
    });
  }
};

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

async function registerPlugins() {
  try {
    await server.register({ plugin: tasksApi });
  }
  catch (err) {
    console.log(err);
    process.exit(1);
  }
  console.log('Plugins registered\n');
}

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

registerPlugins().then(() => start());