const es = require('elasticsearch');
const config = require('config');
const R = require('ramda');
const Promise = require('bluebird');

const mappings = require('./task-mappings.json');
const tasks = require('./data/tasks.json');

const esClient = new es.Client({ host: config.get('elasticsearch').host });

const safeDelete = (index) =>
  esClient.indices.exists({ index })
    .then(exists => exists ? esClient.indices.delete({ index }) : Promise.resolve());

const createIndex = (index, settings) =>
  esClient.indices.create({ index, body: settings });

const index = 'todone-tasks';
const type = 'task';

/* eslint-disable no-underscore-dangle */
const bulkRequestBuilder = R.compose(
  R.flatten,
  R.map(item => [
    {
      index: {
        _index: index,
        _type: type
      }
    },
    R.omit(['id'], item)
  ])
);
/* eslint-enable */

const bulkTest = bulkRequestBuilder(tasks);

safeDelete(index)
  .then(() => createIndex(index, mappings))
  .then(() => esClient.bulk({ body: bulkRequestBuilder(tasks) }))
  .catch(console.log);
