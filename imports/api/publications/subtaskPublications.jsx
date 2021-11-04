import React from 'react';

import { check } from 'meteor/check';

import {
  SubtasksCollection
} from '/imports/api/subtasksCollection';

Meteor.publish('subtasks', function publishSubtasks() {
  return SubtasksCollection.find( { } );
});
