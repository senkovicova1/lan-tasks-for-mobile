import React from 'react';

import {
  SubtasksCollection
} from '/imports/api/subtasksCollection';

export const addNewSubtask = ( name, closed, task, dateCreated ) => {
  SubtasksCollection.insert( {
    name,
    task,
    closed,
    dateCreated
  } );
};

export const editSubtask = ( subtaskId, name, closed, task, dateCreated ) => {
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
};

export const removeSubtask = ( subtaskId ) => {
  SubtasksCollection.remove( {
    _id: subtaskId
  } );
}
