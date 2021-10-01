import React, {
  useMemo,
  useState,
} from 'react';

import {
  Modal,
  ModalBody
} from 'reactstrap';

import {
  useTracker
} from 'meteor/react-meteor-data';

import {
  TasksCollection
} from '/imports/api/tasksCollection';

import {
  addNewSubtask,
  editSubtask,
  removeSubtask
} from './subtasksHandlers';
import {
  addNewComment,
  removeComment
} from './commentsHandlers';

import Form from './form';

import {
  PlusIcon
} from "/imports/other/styles/icons";

import {
  FloatingButton
} from '/imports/other/styles/styledComponents';

import {
  translations
} from '/imports/other/translations.jsx';

export default function AddTaskContainer( props ) {

  const {
    match,
    backgroundColor
  } = props;

  const user = useTracker( () => Meteor.user() );
  const language = useMemo( () => {
    return user.profile.language;
  }, [ user ] );

  const [ addTaskOpen, showAddTask ] = useState( false );

  const toggleAddTask = () => showAddTask( !addTaskOpen );

  const addNewTask = ( name, important, assigned, deadline, hours, description, subtasks, comments, files, folder, dateCreated ) => {
    TasksCollection.insert( {
      name,
      important,
      assigned,
      deadline,
      hours,
      description,
      folder,
      files,
      dateCreated,
      closed: false
    }, ( error, _id ) => {
      if ( error ) {
        console.log( error );
      } else {
        const addedSubtasks = subtasks.filter( subtask => subtask.change === ADDED );
        const editedSubtasks = subtasks.filter( subtask => subtask.change === EDITED );
        const deletedSubtasks = subtasks.filter( subtask => subtask.change === DELETED );

        addedSubtasks.forEach( ( subtask, i ) => {
          addNewSubtask( subtask.name, subtask.closed, _id, subtask.dateCreated );
        } );

        editedSubtasks.forEach( ( subtask, i ) => {
          editSubtask( subtask._id, subtask.name, subtask.closed, _id, subtask.dateCreated );
        } );

        deletedSubtasks.forEach( ( subtask, i ) => {
          removeSubtask( subtask._id );
        } );

        const addedComments = comments.filter( comment => comment.change === ADDED );
        const editedComments = comments.filter( comment => comment.change === EDITED );
        const deletedComments = comments.filter( comment => comment.change === DELETED );

        addedComments.forEach( ( comment, i ) => {
          addNewComment( comment.author, comment.task, comment.dateCreated, comment.body );
        } );

        editedComments.forEach( ( comment, i ) => {
          editComment( comment._id, comment.author, comment.task, comment.dateCreated, comment.body );
        } );

        deletedComments.forEach( ( comment, i ) => {
          removeComment( comment._id );
        } );

      }
    } );
    showAddTask( false );
  }

  const close = () => {
    showAddTask( false );
  }

  return (
    <div>
      {
        !addTaskOpen &&
        <FloatingButton onClick={toggleAddTask}>
          <img
            className="icon"
            src={PlusIcon}
            alt="Plus icon not found"
            />
          {
            !/Mobi|Android/i.test(navigator.userAgent) &&
            <span>
              {translations[language].task}
            </span>
          }
        </FloatingButton>
      }
      {
        addTaskOpen &&
        <Modal className="add-task-modal" isOpen={true}>
          <ModalBody>
            <Form {...props} onSubmit={addNewTask} onCancel={close} language={language}/>
          </ModalBody>
        </Modal>
      }
    </div>
  );
};
