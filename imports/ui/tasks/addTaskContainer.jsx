import React, {
  useState,
  useMemo
} from 'react';

import {
  TasksCollection
} from '/imports/api/tasksCollection';

import {
  useTracker
} from 'meteor/react-meteor-data';

import PlusIcon from "../../other/styles/icons/plus.svg";
import {
  translations
} from '../../other/translations.jsx';

import {
  Modal,
  ModalBody
} from 'reactstrap';

import TaskForm from './taskForm';

import {
  FloatingButton
} from '../../other/styles/styledComponents';

export default function AddTaskContainer( props ) {

  const {
    match,
    backgroundColor
  } = props;

  const user = useTracker( () => Meteor.user() );
  const language = useMemo(() => {
    return user.profile.language;
  }, [user]);

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
      {!addTaskOpen &&
      <FloatingButton onClick={toggleAddTask}>
      <img
        className="icon"
        src={PlusIcon}
        alt="Plus icon not found"
        />
      </FloatingButton>
    }
          {addTaskOpen &&
          <Modal isOpen={true}>
            <ModalBody>
          <TaskForm {...props} onSubmit={addNewTask} onCancel={close} language={language}/>
        </ModalBody>
      </Modal>
        }
    </div>
  );
};
