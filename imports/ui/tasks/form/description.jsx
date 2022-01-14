import React, {
  useEffect,
  useState,
} from 'react';

import {
  writeHistoryAndSendNotifications,
} from '/imports/api/handlers/tasksHandlers';

import {
  CloseIcon,
  SendIcon,
  TextIcon,
} from "/imports/other/styles/icons";

import {
  Textarea,
  ButtonRow,
  LinkButton,
  FullButton,
} from "/imports/other/styles/styledComponents";

import {
  DESCRIPTION,
 historyEntryTypes
} from '/imports/other/messages';

import {
  translations
} from '/imports/other/translations';

export default function Description( props ) {

  const {
    userId,
    closed,
    taskId,
    taskName,
    changeID,
    assigned,
    description,
    folder,
    dbUsers,
    notifications,
    history,
    language,
    addNewTask,
  } = props;

  const [ newDescription, setNewDescription ] = useState( "" );
  const [ descriptionInFocus, setDescriptionInFocus ] = useState( false );

  useEffect(() => {
    setNewDescription(description);
  }, [description]);

  useEffect(() => {
    window.addEventListener('beforeunload', function (e) {
        e.preventDefault();
        e.returnValue = "Are you sure you want to exit?";
        saveUnsavedData();
    });
  }, []);

  const saveUnsavedData = () => {
    if (description !== newDescription){
      const oldDesc = description;
        Meteor.call(
          'tasks.updateSimpleAttribute',
          taskId,
          {
            description: newDescription,
            changeID: (changeID ? changeID + 1 : 1)%1000
          }
        );

        writeHistoryAndSendNotifications(
          userId,
          taskId,
          [DESCRIPTION],
          [[newDescription]],
          history,
          assigned,
          notifications,
          [[`id__${taskId}__id`]],
          [[taskName]],
          folder._id,
          dbUsers,
        );

    }
  }

  const txHeight = 40;
  const tx = document.getElementsByTagName( "textarea" );
  for ( let i = 0; i < tx.length; i++ ) {
    if ( tx[ i ].value == '' || (tx[i].id === "task-title" && tx[ i ].scrollHeight < 76) || (tx[i].id !== "task-title" && tx[ i ].scrollHeight < 51) ) {
      tx[ i ].setAttribute( "style", "height:" + txHeight + "px;overflow-y:hidden;" );
    } else {
      tx[ i ].setAttribute( "style", "height:" + ( tx[ i ].scrollHeight ) + "px;overflow-y:hidden;" );
    }
    tx[ i ].addEventListener( "input", OnInput, false );
  }

  function OnInput( e ) {
    this.style.height = "auto";
    this.style.height = ( this.scrollHeight ) + "px";
  }

  return (
    <section style={{padding: "0px"}}>
      <section className="inline">
        <span className="icon-container">
          <img
            className="label-icon"
            htmlFor="description"
            src={TextIcon}
            alt="Text icon not found"
            />
        </span>
        <Textarea
          type="text"
          placeholder={closed ? translations[language].noDescription : translations[language].writeDescription}
          value={newDescription && !addNewTask ? newDescription : description}
          disabled={closed}
          onFocus={() => {
            setDescriptionInFocus(true);
          }}
          onChange={(e) => {
            setNewDescription(e.target.value);
          }}
          onBlur={() => {
            if (!addNewTask){
              saveUnsavedData();
            }
          }}
          />
      </section>

    </section>

  );
};
