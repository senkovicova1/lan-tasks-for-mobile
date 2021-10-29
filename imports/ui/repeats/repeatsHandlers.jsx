import React from 'react';
import moment from 'moment';

import {
  RepeatsCollection
} from '/imports/api/repeatsCollection';

import {
  updateSimpleAttribute
} from '/imports/ui/tasks/tasksHandlers';

export const addRepeat = ( intervalNumber, intervalFrequency, customInterval, useCustomInterval, repeatStart, repeatUntil, tasks, onSuccess, onFail ) => {
  RepeatsCollection.insert( {
    intervalNumber,
    intervalFrequency,
    customInterval,
    useCustomInterval,
    repeatStart,
    repeatUntil,
    tasks
  }, ( error, _id ) => {
    if ( error ) {
      onFail( error );
    } else {
      onSuccess( _id );
    }
  } );
}

export const setRepeatTasks = ( _id, tasks ) => {
  let data = {
    tasks
  };
  RepeatsCollection.update( _id, {
    $set: data
  } );
}

export const addRepeatTask = ( _id, task ) => {
  RepeatsCollection.update( _id, {
    $push: {
      tasks: task
    }
  } );
}

export const removeTaskFromRepeat = ( taskId, repeatId ) => {
  RepeatsCollection.update( repeatId, {
    $pull: {
      tasks: taskId
    }
  } );
}

export const editRepeatInTask = ( oldRepeat, newRepeat, allTasks ) => {
  const tasksWithThisRepeat = allTasks.filter(task => oldRepeat.tasks.includes(task._id));

  if (tasksWithThisRepeat.some(task => task.closed)){
    RepeatsCollection.insert( {
      intervalNumber: newRepeat.intervalNumber,
      intervalFrequency: newRepeat.intervalFrequency,
      customInterval: newRepeat.customInterval,
      useCustomInterval: newRepeat.useCustomInterval,
      repeatStart: newRepeat.repeatStart,
      repeatUntil: newRepeat.repeatUntil,
      tasks: tasksWithThisRepeat.filter(task => !task.closed).map(task => task._id)
    }, ( error, _id ) => {
      tasksWithThisRepeat.filter(task => !task.closed).forEach((task, i) => {
          updateSimpleAttribute(task._id, {repeat: _id});
      });
    } );
    RepeatsCollection.update( oldRepeat._id, {
      $set: {
        tasks: tasksWithThisRepeat.filter(task => task.closed).map(task => task._id),
      }
    } );
  } else {
    let data = {
      intervalNumber: newRepeat.intervalNumber,
      intervalFrequency: newRepeat.intervalFrequency,
      customInterval: newRepeat.customInterval,
      useCustomInterval: newRepeat.useCustomInterval,
      repeatStart: newRepeat.repeatStart,
      repeatUntil: newRepeat.repeatUntil,
      tasks: oldRepeat.tasks
    };

    RepeatsCollection.update( oldRepeat._id, {
      $set: {
        ...data
      }
    } );
  }

  tasksWithThisRepeat.forEach((task, i) => {
    if (!task.closed){
      updateSimpleAttribute(task._id, {repeat: oldRepeat._id});
    }
  });


}

export const removeRepeat = ( _id ) => {
  RepeatsCollection.remove( {
    _id
  } );
}
