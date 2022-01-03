import React from 'react';

import { check } from 'meteor/check';

import moment from 'moment';

import {
  useSelector
} from 'react-redux';

import {
  TasksCollection
} from '/imports/api/tasksCollection';

import {
  RepeatsCollection
} from '/imports/api/repeatsCollection';

Meteor.methods({
  'repeats.addRepeat'(  intervalNumber, intervalFrequency, customInterval, useCustomInterval, repeatStart, repeatUntil, tasks ) {
  //  check(text, String);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    return RepeatsCollection.insert( {
      intervalNumber,
      intervalFrequency,
      customInterval,
      useCustomInterval,
      repeatStart,
      repeatUntil,
      tasks
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

  'repeats.removeTaskFromRepeat'( taskId, repeatId) {
  //  check(taskId, String);
  //  check(isChecked, Boolean);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

        const tasksWithThisRepeat = TasksCollection.find({
          repeat: repeatId
        }).fetch();

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

  'repeats.editRepeatInTask'( oldRepeat, newRepeat ) {
  //  check(taskId, String);
  //  check(isChecked, Boolean);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    const tasksWithThisRepeat = TasksCollection.find({
      repeat: oldRepeat._id
    }).fetch();

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
        if (error){
          console.log(error);
        } else {
          tasksWithThisRepeat.filter(task => !task.closed).forEach((task, i) => {

              TasksCollection.update( task._id, {
                $set: {repeat: _id}
              }, (e, i) => {
                console.log(e);
              } );

          });

          RepeatsCollection.update( oldRepeat._id, {
            $set: {
              tasks: tasksWithThisRepeat.filter(task => task.closed).map(task => task._id),
            }
          } );
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
