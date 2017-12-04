const fs = require('fs');
const path = require('path');
// const moment = require('moment');

const tasks = [
  {
    id: '1',
    description: 'Do this',
    duedate: new Date('2018-04-01'),
    complete: false,
    context: {
      project: '',
      type: '',
      location: ''
    }
  },
  {
    id: '2',
    description: 'Do that',
    duedate: new Date('2017-12-25'),
    complete: false,
    context: {
      project: '',
      type: '',
      location: ''
    }
  },
  {
    id: '3',
    description: 'Save the world',
    duedate: new Date('2017-11-30'),
    complete: false,
    context: {
      project: '',
      type: '',
      location: ''
    }
  },
  {
    id: '4',
    description: 'Go to the moon',
    duedate: new Date('1969-07-20'),
    complete: true,
    context: {
      project: 'Beat the Russians to the Moon',
      type: '',
      location: 'Moon'
    }
  }
];

fs.writeFileSync(path.join(__dirname, 'tasks.json'), JSON.stringify(tasks, null, 2));
