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

import { PlusIcon} from  "/imports/other/styles/icons";
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

  const addNewTask = ( name, assigned, folder, dateCreated ) => {
    TasksCollection.insert( {
      name,
      assigned,
      folder,
      dateCreated,
      closed: false
    } );
    showAddTask( false );
  }

  const close = () => {
    showAddTask( false );
  }
//position: "sticky", bottom: "2px", left: "100%"
  return (
    <div style={{}}>
      {!addTaskOpen &&
      <FloatingButton onClick={toggleAddTask}>
        <img
          className="icon"
          src={PlusIcon}
          alt="Plus icon not found"
          />
        <span>
        {translations[language].task}
      </span>
      </FloatingButton>
    }
          {addTaskOpen &&
          <Modal className="add-task-modal" isOpen={true}>
            <ModalBody>
          <TaskForm {...props} onSubmit={addNewTask} onCancel={close} language={language}/>
        </ModalBody>
      </Modal>
        }
    </div>
  );
};
