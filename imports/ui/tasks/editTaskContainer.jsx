import React, {
  useState,
  useEffect
} from 'react';

import {
  TasksCollection
} from '/imports/api/tasksCollection';

import {
  Modal,
  ModalBody
} from 'reactstrap';

import TaskForm from './taskForm';

export default function EditTaskContainer( props ) {

  const {
    task,
    setChosenTask,
    users,
    folders,
  } = props;

  const [ search, setSearch ] = useState( "" );
  const [ editTaskModalOpen, showEditTaskModal ] = useState( false );

  useEffect( () => {
    if ( task ) {
      showEditTaskModal( true )
    } else {
      showEditTaskModal( false )
    }
  }, [ task ] )

  const editTask = ( title, important, description, status, assigned, folder, actions, materials, deadline ) => {
    let data = {};
    if ( task.title !== title ) {
      data.title = title;
    }
    if ( task.important !== important ) {
      data.important = important;
    }
    if ( task.description !== description ) {
      data.description = description;
    }
    if ( task.status !== status ) {
      data.status = status;
    }
    if ( task.assigned.length != assigned.length || task.assigned.filter( user => !assigned.includes( user._id ) ) ) {
      data.assigned = assigned;
    }
    if ( !task.folder || ( task.folder._id !== folder ) ) {
      data.folder = folder;
    }
    data.actions = actions;
    data.materials = materials;
    data.deadline = deadline;
    TasksCollection.update( task._id, {
      $set: {
        ...data
      }
    } )
    setChosenTask( null );
  }

  const removeTask = ( taskId ) => {
    if ( window.confirm( "Are you sure you want to permanently remove this task?" ) ) {
      TasksCollection.remove( {
        _id: taskId
      } );
    }
  }

  const closeModal = () => {
    setChosenTask( null );
  }

  return (
    <Modal isOpen={editTaskModalOpen} toggle={() => setChosenTask( null )}>
      <ModalBody>
        <TaskForm {...task} users={users} folders={folders} onSubmit={editTask} onCancel={closeModal} onRemove={removeTask}/>
      </ModalBody>
    </Modal>
  );
};
