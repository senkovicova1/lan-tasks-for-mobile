import React, {
  useState,
} from 'react';

import {
  useSelector
} from 'react-redux';

import moment from 'moment';

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
    taskId,
    assigned,
    description,
    setDescription,
    history,
    language,
    addNewTask,
  } = props;

  const [ newDescription, setNewDescription ] = useState( "" );
  const [ descriptionInFocus, setDescriptionInFocus ] = useState( false );

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
          value={newDescription ? newDescription : description}
          disabled={closed}
          onFocus={() => {
            setDescriptionInFocus(true);
          }}
          onChange={(e) => {
            setNewDescription(e.target.value);
          }}
          onBlur={() => {
            if ( !addNewTask) {
              const oldDesc = description;
              timeout  = setTimeout(() => {
                if (newDescription){
                  setDescription(newDescription);
                    Meteor.call(
                      'tasks.updateSimpleAttribute',
                      taskId,
                      {
                        description: newDescription
                      }
                    );
                  setDescriptionInFocus(false);
                  const historyData = {
                    dateCreated: moment().unix(),
                    user: userId,
                    type: DESCRIPTION,
                    args: [newDescription],
                  };
                  if (history.length === 0){
                    Meteor.call(
                      'history.addNewHistory',
                      taskId,
                      [
                        historyData
                      ]
                    );
                  } else {
                    Meteor.call(
                      'history.editHistory',
                      history[0]._id,
                      historyData
                    )
                  }
                  if (assigned.length > 0){
                    assigned.filter(assigned => assigned._id !== userId).map(assigned => {
                      let usersNotifications = notifications.find( notif => notif._id === assigned._id );
                      const notificationData = {
                        ...historyData,
                        args: [name],
                        read: false,
                        taskId,
                        folderId: folder._id,
                      };
                     if (usersNotifications.notifications.length > 0){
                       Meteor.call(
                         'notifications.editNotifications',
                          assigned._id,
                          assigned.email,
                          notificationData,
                          dbUsers
                        );
                      } else {
                        Meteor.call(
                          'notifications.addNewNotification',
                          assigned._id,
                          assigned.email,
                          [
                            notificationData
                           ],
                           dbUsers
                         );
                      }
                    })
                  }
                }
              }, 1500);
            }
          }}
          />
      </section>
      {
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
              const oldDesc = description;
              clearTimeout(timeout);
              setDescription(newDescription);
                Meteor.call(
                  'tasks.updateSimpleAttribute',
                  taskId,
                  {
                    description: newDescription
                  }
                );
              setDescriptionInFocus(false);
              const historyData = {
                dateCreated: moment().unix(),
                user: userId,
                type: DESCRIPTION,
                args: [newDescription],
              };
              if (history.length === 0){
                Meteor.call(
                  'history.addNewHistory',
                  taskId,
                  [
                    historyData
                  ]
                );
              } else {
                Meteor.call(
                  'history.editHistory',
                  history[0]._id,
                  historyData
                )
              }
              if (assigned.length > 0){
                assigned.filter(assigned => assigned._id !== userId).map(assigned => {
                  let usersNotifications = notifications.find( notif => notif._id === assigned._id );
                  const notificationData = {
                    ...historyData,
                    args: [name],
                    read: false,
                    taskId,
                    folderId: folder._id,
                  };
                 if (usersNotifications.notifications.length > 0){
                   Meteor.call(
                     'notifications.editNotifications',
                      assigned._id,
                      assigned.email,
                      notificationData,
                      dbUsers
                    );
                  } else {
                    Meteor.call(
                      'notifications.addNewNotification',
                      assigned._id,
                      assigned.email,
                      [
                        notificationData
                       ],
                       dbUsers
                     );
                  }
                })
              }
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
