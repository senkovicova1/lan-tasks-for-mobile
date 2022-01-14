import React from 'react';

import { check } from 'meteor/check';

import {
  TasksCollection
} from '/imports/api/tasksCollection';

import {
  RepeatsCollection
} from '/imports/api/repeatsCollection';

import {
  NO_CHANGE,
  ADDED,
  EDITED,
  DELETED
} from '/imports/other/constants';

import {
  ADD_TASK,
  ADD_AND_ASSIGN
} from '/imports/other/messages';

const { DateTime } = require("luxon");

Meteor.methods({
  'tasks.addTask'(name, assigned, folder, dateCreated, container) {
  //  check([name, assig], String);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    return TasksCollection.insert( {
      name,
      assigned,
      folder,
      dateCreated,
      closed: false,
      container
    });
  },

  'tasks.addFullTask'(name, important, assigned, startDatetime, endDatetime, hours, description, files, repeatId, folder, container, dateCreated ) {
//    check(text, String);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

      return TasksCollection.insert({
        name,
        important,
        assigned,
        startDatetime,
        endDatetime,
        hours,
        description,
        files,
        closed: false,
        folder,
        container,
        dateCreated,
        repeat: repeatId,
        changeID: 0,
      });
  },

  'tasks.updateSimpleAttribute'(taskId, data) {
  //  check(taskId, String);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    TasksCollection.update( taskId, {
      $set: data
    } );
  },

  'tasks.addRepeatToTask'(taskId, repeat) {
  //  check(taskId, String);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    Meteor.call(
      'repeats.addRepeat',
      repeat.intervalNumber,
      repeat.intervalFrequency,
      repeat.customInterval,
      repeat.useCustomInterval,
      repeat.repeatStart,
      repeat.repeatUntil,
      [taskId],
      (_id) => {
        TasksCollection.update( taskId, {
          $set: {repeat: _id}
        } );
      },
      (error) => console.log(error)
    );

  },

  'tasks.closeTask'( task, subtasks ) {
    //check(taskId, String);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    let data = {
      closed: !task.closed,
      changeID: (task.changeID ? task.changeID + 1 : 1 )%1000
    };
    TasksCollection.update( task._id, {
      $set: {
        ...data
      }
    } );

    if (task.repeat){
      let repeat = RepeatsCollection.findOne({
        _id: task.repeat
      });

      let addAmount = parseInt(repeat.intervalNumber);
      let addTimeType = repeat.intervalFrequency;

          let offset = {};

          switch (addTimeType) {
            case "d":
              offset = {
                days: addAmount
              }
              break;
            case "w":
              offset = {
                weeks: addAmount
              }
              break;
            case "m":
              offset = {
                months: addAmount
              }
              break;
            case "y":
              offset = {
                years: addAmount
              }
              break;
            default:
            break;
          }

      const newStartDatetime = parseInt(DateTime.fromSeconds(task.startDatetime).plus(offset).toSeconds());

      if (!task.closed && task.repeat && (newStartDatetime <= repeat.repeatUntil || !repeat.repeatUntil)){

        let data = {
          name: task.name,
          important: task.important,
          assigned: task.assigned.map(user => user._id),
          startDatetime: newStartDatetime,
          endDatetime: parseInt(DateTime.fromSeconds(task.endDatetime).plus(offset).toSeconds()),
          allDay: task.allDay,
          hours: task.hours,
          description: task.description,
          files: task.files ? [...task.files] : [],
          closed: false,
          folder: task.folder._id,
          container: 0,
          dateCreated: parseInt(DateTime.now().toSeconds()),
          repeat: repeat._id
        };
        TasksCollection.insert({
            ...data
        }, (error, _id) => {
          if (error){
            console.log(error);
          } else {
            subtasks.filter( subtask => subtask.task === task._id ).forEach( ( subtask, i ) => {
              Meteor.call(
                'subtasks.addNewSubtask',
                subtask.name,
                false,
                _id,
                 parseInt(DateTime.now().toSeconds())
              )
            } );
            Meteor.call(
              'repeats.addRepeatTask',
              task.repeat._id,
              _id
            );
          }
        } );
      }
    }
  },

  'tasks.restoreLatestTask'(removedTasks) {
    // check(taskId, String);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    let data = {
      removedDate: null,
    };
    TasksCollection.update( removedTasks[ 0 ]._id, {
      $set: {
        ...data
      }
    } );
  },

  'tasks.removeTask'( taskId ) {
        TasksCollection.remove( {
          _id: taskId,
        } );
  },
});
