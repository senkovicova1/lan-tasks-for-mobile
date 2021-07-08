import React, {
  useState
} from 'react';

import {
  Icon
} from '@fluentui/react/lib/Icon';

import {
  TasksCollection
} from '/imports/api/tasksCollection';

import {
  Modal,
  ModalBody
} from 'reactstrap';

import TaskForm from './taskForm';

import {
  LinkButton
} from '../../other/styles/styledComponents';

export default function AddTaskContainer( props ) {

  const {
    match
  } = props;

  const [ addTaskOpen, showAddTask ] = useState( false );

  const toggleAddTask = () => showAddTask( !addTaskOpen );

  const addNewTask = ( name, folder, dateCreated ) => {
    TasksCollection.insert( {
      name,
      folder,
      dateCreated,
      closed: false
    } );
    showAddTask( false );
  }

  const close = () => {
    showAddTask( false );
  }

  return (
    <div>
      <LinkButton onClick={toggleAddTask}> <Icon iconName="Add"/> Task </LinkButton>
          {addTaskOpen &&
          <TaskForm {...props} onSubmit={addNewTask} onCancel={close}/>
        }
    </div>
  );
};
