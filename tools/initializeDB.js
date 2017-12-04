const es = require('elasticsearch');
const config = require('config');
const R = require('ramda');
const Promise = require('bluebird');

const mappings = require('./task-mappings.json');
const tasks = require('./data/tasks.json');

console.log(`elasticsearch host = ${config.get('elasticsearch').host}`)
const esClient = new es.Client({ host: config.get('elasticsearch').host });

// console.log(JSON.stringify(tasks, null, 2));

const safeDelete = (index) =>
    esClient.indices.exists({ index })
      .then(exists => exists ? esClient.indices.delete({ index }) : {})
      .catch(console.log);

/* eslint-disable no-underscore-dangle */
const bulkRequestBuilder = R.compose(
  R.flatten,
  R.map(item => [
    {
      index: {
        _index: 'todone-task',
        _type: 'task'
      }
    },
    item
  ])
);
/* eslint-enable */

const delay = 5000;
const index = 'todone-tasks';

Promise.resolve(esClient.indices.exists({ index })).tap(console.log)
  .then(exists => {
    if (exists) {
      return esClient.indices.delete({ index });
    }
    else {
      return Promise.resolve();
    }
  })
  .then(esClient.indices.exists({ index }).then(console.log))
  .then(esClient.indices.create({ index: 'todone-tasks', body: mappings }))
  .catch(console.log);
