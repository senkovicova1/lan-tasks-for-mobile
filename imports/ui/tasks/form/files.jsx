import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useSelector
} from 'react-redux';

import moment from 'moment';

import {
  Spinner
} from 'reactstrap';

import {
  PlusIcon,
  CloseIcon,
  SendIcon,
  PaperClipIcon,
} from "/imports/other/styles/icons";

import {
  Input,
  LinkButton,
  FileContainer,
} from "/imports/other/styles/styledComponents";

import {
  REMOVE_FILE,
  ADD_FILE,
 historyEntryTypes
} from '/imports/other/messages';

import {
  translations
} from '/imports/other/translations';

export default function Files( props ) {

  const {
    userId,
    taskId,
    files,
    history,
    language,
    addNewTask,
    onCancel,
  } = props;

  const [ showSpinner, setShowSpinner ] = useState( false );

  return (
      <section  className="inline">
        <span className="icon-container">
          <img
            className="label-icon"
            htmlFor="files"
            src={PaperClipIcon}
            alt="PaperClip icon not found"
            />
        </span>
        <div className="files">
          {
            files.map(file => (
              <FileContainer key={file.dateCreated}>
                <a href={file.data} download={file.name}>{file.name}</a>
                <LinkButton
                  disabled={closed}
                  onClick={(e) => {
                    e.preventDefault();
                    if ( !addNewTask ) {
                      const oldFile = file;
                        Meteor.call(
                          'tasks.updateSimpleAttribute',
                          taskId,
                          {
                            files: files.filter(f => f.dateCreated !== file.dateCreated)
                          }
                        );
                      const historyData = {
                        dateCreated: moment().unix(),
                        user: userId,
                        type: REMOVE_FILE,
                        args: [oldFile.name],
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
                            args: [oldFile.name, name],
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
                  }}
                  className="connected-btn"
                  >
                  <img
                    className="icon"
                    src={CloseIcon}
                    alt="Close icon not found"
                    />
                </LinkButton>
              </FileContainer>
            ))
          }
          {
            showSpinner &&
            <Spinner color="primary" size="1em" className="spinner" children=""/>
          }
          {
            closed &&
            <span className={"datetime-span" + (closed ? " closed" : "")} >
              <span>
                {translations[language].noFiles}
              </span>
            </span>
          }
          {
            !closed &&
          <Input
            id="files"
            name="files"
            type="file"
            disabled={closed}
            onChange={(e) =>  {
              e.persist();
              var file = e.target.files[0];
              setShowSpinner(true);
              if (!file) return;
              var reader = new FileReader();
              reader.onload = e => {
                var newFile = {
                  dateCreated: moment().unix(),
                  name: file.name,
                  data: reader.result
                };
                setShowSpinner(false);
                if ( !addNewTask ) {
                  Meteor.call(
                    'tasks.updateSimpleAttribute',
                    taskId,
                    {
                      files: [...files, newFile]
                    }
                  );
                  const historyData = {
                    dateCreated: moment().unix(),
                    user: userId,
                    type: ADD_FILE,
                    args: [newFile.name]
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
                        args: [newFile.name, name],
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
                } else {
                  setFiles([...files, newFile]);
                }
              };
              reader.readAsDataURL(file);
            }}
            />
        }
        </div>
      </section>

  );
};
