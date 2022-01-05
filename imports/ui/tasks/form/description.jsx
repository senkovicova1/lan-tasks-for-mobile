import React, {
  useEffect,
  useState,
} from 'react';

import {
  useSelector
} from 'react-redux';

import moment from 'moment';

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
    assigned,
    description,
    setDescription,
    folder,
    dbUsers,
    notifications,
    history,
    language,
    addNewTask,
  } = props;

  const [ newDescription, setNewDescription ] = useState( "" );
  const [ descriptionInFocus, setDescriptionInFocus ] = useState( false );
  const [ saveInterval, setSaveInterval ] = useState(null);

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
            description: newDescription
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

  let timeout = null;

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
      {
        false &&
        !addNewTask &&
        descriptionInFocus &&
        <ButtonRow>
          <LinkButton
            style={{marginLeft: "auto", marginRight: "0.6em"}}
            disabled={closed}
            onClick={(e) => {
              e.preventDefault();
              clearTimeout(timeout);
              setNewDescription("");
              setDescriptionInFocus(false);
            }}
            >
            <img
              className="icon"
              style={{width: "1.6em", margin: "0em"}}
              src={CloseIcon}
              alt="CloseIcon icon not found"
              />
          </LinkButton>
          <FullButton
            colour=""
            style={{marginRight: "0px", width: "100px", paddingLeft: "0px"}}
            disabled={closed}
            onClick={(e) => {
              e.preventDefault();
            }}
            >
            <img
              className="icon"
              style={{width: "1.6em", margin: "0em"}}
              src={SendIcon}
              alt="Send icon not found"
              />
            {translations[language].save}
          </FullButton>
        </ButtonRow>
      }
    </section>

  );
};
