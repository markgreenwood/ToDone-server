const Hapi = require('hapi');
const config = require('config');
const es = require('elasticsearch');
const eb = require('elastic-builder');
const R = require('ramda');

const pkg = require('./package');

const esClient = new es.Client({ host: config.get('elasticsearch').host });

const { host, port } = config.get('hapiServer');

const server = Hapi.server({ host, port });

const standardApi = {
  name: 'standardApi',
  version: '1.0.0',
  register: async (server, options) => {
    server.route({
      method: 'GET',
      path: '/',
      handler: (request, h) => 'Hello, world, from ToDone-server!\n'
    });

    server.route({
      method: 'GET',
      path: '/healthcheck',
      handler: (request, h) => ({ status: 'ok', service: 'ToDone-server', version: pkg.version })
    });
  }
}

const tasksApi = {
  name: 'tasksApi',
  version: '1.0.0',
  register: async (server, options) => {
    server.route({
      method: 'GET',
      path: '/tasks',
      handler: (request, h) =>
        esClient.search({ index: 'todone-tasks', type: 'task' })
          .then(resp => R.map(item => R.merge(item._source, { itemId: item._id }), resp.hits.hits)),
      config: {
        tags: ['api']
      }
    });

    server.route({
      method: 'GET',
      path: '/tasks/{id}',
      handler: (request, h) =>
        esClient.get({ index: 'todone-tasks', type: 'task', id: request.params.id })
          .then(resp => resp._source),
      config: {
        tags: ['api']
      }
    });
  }
};

async function registerPlugins(theServer) {
  try {
    await theServer.register(standardApi);
    await theServer.register(tasksApi);
  }
  catch (err) {
    console.log(err);
    process.exit(1);
  }
  console.log(`Plugins registered on ${theServer.info.uri}`);
  return theServer;
}

async function startServer(theServer) {
  try {
    await theServer.start();
  }
  catch (err) {
    console.log(err);
    process.exit(1);
  }
  console.log(`Server running at ${theServer.info.uri}`);
  return theServer;
}

registerPlugins(server)
  .then(startServer);