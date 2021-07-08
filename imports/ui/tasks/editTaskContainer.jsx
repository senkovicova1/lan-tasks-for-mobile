import React from 'react';

import {
  TasksCollection
} from '/imports/api/tasksCollection';

import TaskForm from './taskForm';

export default function EditTaskContainer( props ) {

  const {
    task,
    close
  } = props;

  const editTask = ( name ) => {
    let data = {name};
    TasksCollection.update( task._id, {
      $set: {
        ...data
      }
    } )
    close();
  }


  return (
        <TaskForm {...task} {...props} onSubmit={editTask} onCancel={close}/>
  );
};
