import React from 'react';

import { check } from 'meteor/check';

import moment from 'moment';

import {
  useSelector
} from 'react-redux';

import {
  RepeatsCollection
} from '/imports/api/repeatsCollection';

Meteor.methods({
  'repeats.addRepeat'(  intervalNumber, intervalFrequency, customInterval, useCustomInterval, repeatStart, repeatUntil, tasks, onSuccess, onFail ) {
  //  check(text, String);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

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
  },

  'repeats.setRepeatTasks'(_id, tasks) {
  //  check(taskId, String);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    let data = {
      tasks
    };
    RepeatsCollection.update( _id, {
      $set: data
    } );
  },

  'repeats.addRepeatTask'(  _id, task  ) {
  //  check(taskId, String);
  //  check(isChecked, Boolean);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    RepeatsCollection.update( _id, {
      $push: {
        tasks: task
      }
    } );
  },

  'repeats.removeTaskFromRepeat'( taskId, repeatId, allTasks) {
  //  check(taskId, String);
  //  check(isChecked, Boolean);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

      const tasksWithThisRepeat = allTasks.filter(task => task.repeat === repeatId);
      if (tasksWithThisRepeat.length > 1){
        RepeatsCollection.update( repeatId, {
          $pull: {
            tasks: taskId
          }
        } );
      } else {
        RepeatsCollection.remove( { _id: repeatId });
      }
  },

  'repeats.editRepeatInTask'( oldRepeat, newRepeat, allTasks ) {
  //  check(taskId, String);
  //  check(isChecked, Boolean);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

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
            Meteor.call(
              'tasks.updateSimpleAttribute',
              task._id,
              {repeat: _id}
            )
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
        Meteor.call(
          'tasks.updateSimpleAttribute',
          task._id,
          {repeat: oldRepeat._id}
        )
      }
    });
  },

  'repeats.removeRepeat'( _id ) {
  //  check(taskId, String);
  //  check(isChecked, Boolean);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    RepeatsCollection.remove( {
      _id
    } );
  },

});
