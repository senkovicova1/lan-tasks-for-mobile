import React, {
  useMemo
} from 'react';

import {
  TasksCollection
} from '/imports/api/tasksCollection';

import {
  useTracker
} from 'meteor/react-meteor-data';

import {
  translations
} from '../../other/translations.jsx';

import {
  Modal,
  ModalBody
} from 'reactstrap';

import TaskForm from './taskForm';

export default function EditTaskContainer( props ) {

  const {
    task,
    close
  } = props;

  const user = useTracker( () => Meteor.user() );
  const language = useMemo(() => {
    return user.profile.language;
  }, [user]);

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
    <Modal isOpen={true}>
      <ModalBody>
        <h1 style={{fontSize: "2em"}}>{translations[language].editTask}</h1>
        <TaskForm {...task} {...props} onSubmit={editTask} onCancel={close} language={language}/>
      </ModalBody>
    </Modal>
  );
};
