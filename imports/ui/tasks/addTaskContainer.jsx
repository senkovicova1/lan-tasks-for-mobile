import React, {
  useState,
  useMemo
} from 'react';

import {
  Icon
} from '@fluentui/react/lib/Icon';

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

import {
  LinkButton
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
      <LinkButton style={{marginLeft: "1em"}} onClick={toggleAddTask}> <Icon iconName="Add"/> {translations[language].task} </LinkButton>
    }
          {addTaskOpen &&
          <TaskForm {...props} onSubmit={addNewTask} onCancel={close} language={language}/>
        }
    </div>
  );
};
