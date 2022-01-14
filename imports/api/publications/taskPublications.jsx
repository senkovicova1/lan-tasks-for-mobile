import React from 'react';

import {
  check
} from 'meteor/check';

import {
  TasksCollection
} from '/imports/api/tasksCollection';


Meteor.publish( 'tasks', function publishTasks() {
  return TasksCollection.find( {} );
} );
