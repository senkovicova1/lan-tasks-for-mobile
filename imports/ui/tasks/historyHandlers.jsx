import React from 'react';

import {
  HistoryCollection
} from '/imports/api/subtasksCollection';

/*
type change = {
dateCreated: unix,
user: _id,
attribute: string,
oldValue: string,
newValue: string,
}
*/

export const addNewHistory = ( changes ) => {
  HistoryCollection.insert( {
    task,
    changes
  } );
};

export const editHistory = ( historyId, taskId, additionalChanges ) => {
  HistoryCollection.update( historyId, {
    $push: {
      changes: additionalChanges
     }
  } )
};
