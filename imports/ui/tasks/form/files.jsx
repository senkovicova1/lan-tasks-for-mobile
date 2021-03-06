import React, {
  useState,
} from 'react';

import {
  Spinner
} from 'reactstrap';

import {
  writeHistoryAndSendNotifications,
} from '/imports/api/handlers/tasksHandlers';

import {
  CloseIcon,
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

const { DateTime } = require("luxon");

export default function Files( props ) {

  const {
    userId,
    taskId,
    taskName,
    changeID,
    closed,
    files,
    folder,
    dbUsers,
    notifications,
    history,
    language,
    addNewTask,
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
                            files: files.filter(f => f.dateCreated !== file.dateCreated),
                            changeID: (changeID ? changeID + 1 : 1)%1000
                          }
                        );

                        writeHistoryAndSendNotifications(
                          userId,
                          taskId,
                          [REMOVE_FILE],
                          [[oldFile.name]],
                          history,
                          assigned,
                          notifications,
                          [[oldFile.name, `id__${taskId}__id`]],
                          [[oldFile.name, taskName]],
                          folder._id,
                          dbUsers,
                        );

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
                  dateCreated: parseInt(DateTime.now().toSeconds()),
                  name: file.name,
                  data: reader.result
                };
                setShowSpinner(false);
                if ( !addNewTask ) {
                  Meteor.call(
                    'tasks.updateSimpleAttribute',
                    taskId,
                    {
                      files: [...files, newFile],
                      changeID: (changeID ? changeID + 1 : 1)%1000
                    }
                  );

                  writeHistoryAndSendNotifications(
                    userId,
                    taskId,
                    [ADD_FILE],
                    [[newFile.name]],
                    history,
                    assigned,
                    notifications,
                    [[newFile.name, `id__${taskId}__id`]],
                    [[newFile.name, taskName]],
                    folder._id,
                    dbUsers,
                  );

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
