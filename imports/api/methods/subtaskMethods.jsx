import React from 'react';

import { check } from 'meteor/check';

import {
  SubtasksCollection
} from '/imports/api/subtasksCollection';

Meteor.methods({
  'subtasks.addNewSubtask'( name, closed, task, dateCreated ) {
  //  check(text, String);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    SubtasksCollection.insert( {
      name,
      task,
      closed,
      dateCreated
    } );
  },

  'subtasks.editSubtask'( subtaskId, name, closed, task, dateCreated ) {
  //  check(taskId, String);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    let data = {
      name,
      closed,
      task,
      dateCreated
    };
    SubtasksCollection.update( subtaskId, {
      $set: {
        ...data
      }
    } )
  },

  'subtasks.removeSubtask'( subtaskId ) {
  //  check(taskId, String);
  //  check(isChecked, Boolean);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    SubtasksCollection.remove( {
      _id: subtaskId
    } );
  },

});
