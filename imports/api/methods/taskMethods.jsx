import React from 'react';
import moment from 'moment';

import { check } from 'meteor/check';

import {
  TasksCollection
} from '/imports/api/tasksCollection';
/*
import {
  addNewSubtask,
  editSubtask,
  removeSubtask
} from './subtasksHandlers';

import {
  addNewComment,
  editComment,
  removeComment
} from './commentsHandlers';
*/

import {
 addRepeat,
 setRepeatTasks,
 addRepeatTask
} from '/imports/ui/repeats/repeatsHandlers';

import {
  NO_CHANGE,
  ADDED,
  EDITED,
  DELETED
} from '/imports/other/constants';

Meteor.methods({
  'tasks.addTask'(name, assigned, folder, dateCreated, container, onSuccess, onFail) {
  //  check([name, assig], String);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    TasksCollection.insert( {
      name,
      assigned,
      folder,
      dateCreated,
      closed: false,
      container
    }, ( error, _id ) => {
      if ( error ) {
        onFail( error );
      } else {
        onSuccess(_id);
      }
    } );
  },

  'tasks.addFullTask'(name, important, assigned, startDatetime, endDatetime, hours, description, subtasks, comments, files, oldRepeat, repeat, folder, container, dateCreated, onSuccess, onFail) {
//    check(text, String);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    let repeatId = null;
    if (repeat){
      Meteor.call(
        'repeats.addRepeat',
        repeat.intervalNumber,
        repeat.intervalFrequency,
        repeat.customInterval,
        repeat.useCustomInterval,
        repeat.repeatStart,
        repeat.repeatUntil,
        [],
        (_id) => { repeatId = _id;},
        (error) => console.log(error)
      );
    }

      let data = {
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
        repeatId
      };
      TasksCollection.insert({
          ...data
      }, (error, _id) => {
        if (error){
          onFail(error);
        } else {

          const addedSubtasks = subtasks.filter( subtask => subtask.change === ADDED );

          addedSubtasks.forEach( ( subtask, i ) => {
            Meteor.call(
              "subtasks.addNewSubtask",
              subtask.name,
              subtask.closed,
              _id,
              subtask.dateCreated
            )
          } );

          if (repeatId){
            Meteor.call(
              "repeats.setRepeatTasks",
              repeatId,
              [_id]
            )
          }

          onSuccess(_id);

        }
      } );
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
    };
    TasksCollection.update( task._id, {
      $set: {
        ...data
      }
    } );

    if (task.repeat){
      let addAmount = task.repeat.intervalNumber;
      let addTimeType = task.repeat.intervalFrequency;
      const newStartDatetime = moment(task.startDatetime*1000).add(addAmount, addTimeType).unix();
      if (!task.closed && task.repeat && (newStartDatetime <= task.repeat.repeatUntil || !repeatUntil)){

        let data = {
          name: task.name,
          important: task.important,
          assigned: task.assigned.map(user => user._id),
          startDatetime: newStartDatetime,
          endDatetime: moment(task.endDatetime*1000).add(addAmount, addTimeType).unix(),
          allDay: task.allDay,
          hours: task.hours,
          description: task.description,
          files: [...task.files],
          closed: false,
          folder: task.folder._id,
          container: 0,
          dateCreated: moment().unix(),
          repeat: task.repeat._id
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
                 moment().unix()
              )
            } );

            Meteor.call(
              'repeats.addRepeatTask',
              task.repeat._id,
              _id
            )

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

  'tasks.removeTask'( task, removedTasks, subtasks, comments, allTasks ) {
    if ( removedTasks.length >= 5 ) {
      let difference = removedTasks.length - 4;
      const idsToDelete = removedTasks.slice( 4 ).map( t => t._id );
      const subtasksToDelete = subtasks.filter( subtask => idsToDelete.includes( subtask.task ) );
      const commentsToDelete = comments.filter( comment => idsToDelete.includes( comment.task ) );
      while ( difference > 0 ) {
        TasksCollection.remove( {
          _id: idsToDelete[ difference - 1 ]
        } );

    if (task.repeat){
          Meteor.call(
            'repeats.removeTaskFromRepeat',
            task._id,
            task.repeat._id,
            allTasks
          )
        }
        subtasksToDelete.forEach( ( subtask, i ) => {
          Meteor.call(
            'subtasks.removeSubtask',
            subtask._id
          )
        } );
        commentsToDelete.forEach( ( comment, i ) => {
          removeComment( comment._id );
            Meteor.call(
              'comments.removeComment',
              comment._id
            )
        } );

        difference -= 1;
      }
    }

    let data = {
      removedDate: moment().unix(),
    };
    TasksCollection.update( task._id, {
      $set: {
        ...data
      }
    } );
  },
});
