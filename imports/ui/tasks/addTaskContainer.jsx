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
    users,
    folders
  } = props;

  const [ search, setSearch ] = useState( "" );
  const [ addTaskModalOpen, showAddTaskModal ] = useState( false );

  const toggleAddTaskModal = () => showAddTaskModal( !addTaskModalOpen );

  const addNewTask = ( title, important, description, status, assigned, folder, actions, materials, deadline ) => {
    TasksCollection.insert( {
      title,
      important,
      description,
      status,
      assigned,
      folder,
      actions,
      materials,
      deadline
    } );
    showAddTaskModal( false );
  }

  const closeModal = () => {
    showAddTaskModal( false );
  }

  return (
    <div>
      <LinkButton onClick={toggleAddTaskModal}> <Icon iconName="Add"/> Task </LinkButton>
      <Modal isOpen={addTaskModalOpen} toggle={toggleAddTaskModal}>
        <ModalBody>
          <TaskForm users={users} folders={folders} onSubmit={addNewTask} onCancel={closeModal}/>
        </ModalBody>
      </Modal>
    </div>
  );
};
