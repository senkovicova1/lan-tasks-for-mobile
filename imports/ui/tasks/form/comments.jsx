import React, {
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
  SendIcon,
  UserIcon,
  DeleteIcon,
  PencilIcon,
} from "/imports/other/styles/icons";

import {
  Textarea,
  HiddenTextarea,
  ButtonRow,
  LinkButton,
  CommentContainer,
} from "/imports/other/styles/styledComponents";


import {
  uint8ArrayToImg,
} from '/imports/other/helperFunctions';

import {
  ADD_COMMENT,
  EDIT_COMMENT,
 REMOVE_COMMENT,
 historyEntryTypes
} from '/imports/other/messages';

import {
  translations
} from '/imports/other/translations';

export default function Comments( props ) {

  const {
    userId,
    closed,
    taskId,
    displayedComments,
    comments,
    setComments,
    folder,
    dbUsers,
    notifications,
    history,
    language,
    addNewTask,
    onCancel,
  } = props;

    const [ newCommentBody, setNewCommentBody ] = useState( "" );
    const [ editedComment, setEditedComment ] = useState( null );
    const [ editedCommentBody, setEditedCommentBody ] = useState( "" );

  return (
        <section className="comments">
          {
            !closed &&
          <HiddenTextarea
            type="text"
            disabled={closed}
            id="comments"
            name="comments"
            placeholder={translations[language].writeComment}
            value={newCommentBody}
            onChange={(e) => setNewCommentBody(e.target.value)}
            />
        }
          {
            !closed &&
          <ButtonRow>
            {newCommentBody.length > 0 &&
              <LinkButton
                colour="grey"
                style={{marginLeft: "0px", marginRight: "auto", marginTop: "0.6em"}}
                disabled={closed}
                onClick={(e) => {
                  e.preventDefault();
                  setNewCommentBody("")
                }}
                >
                {translations[language].eraseBody}
              </LinkButton>
            }
            <LinkButton
              colour=""
              style={{marginLeft: "auto", marginRight: "0px", marginTop: "0.6em"}}
              disabled={newCommentBody.length === 0 || closed}
              onClick={(e) => {
                e.preventDefault();
                const dateCreated = moment().unix();
                Meteor.call(
                  'comments.addComment',
                  userId,
                  taskId,
                  dateCreated,
                  newCommentBody
                );

                writeHistoryAndSendNotifications(
                  userId,
                  taskId,
                  [ADD_COMMENT],
                  [[]],
                  history,
                  assigned,
                  notifications,
                  [[`id__${taskId}__id`]],
                  folder._id,
                  dbUsers,
                );

                setNewCommentBody("");
              }}
              >
              <img
                className="icon"
                style={{width: "1.6em", margin: "0em"}}
                src={SendIcon}
                alt="Send icon not found"
                />
              {translations[language].sendComment}
            </LinkButton>
          </ButtonRow>
        }
        {
          closed &&
          displayedComments.length === 0 &&
          <span>{translations[language].noComments}</span>
        }
          {
            displayedComments.length > 0 &&
            displayedComments.map(comment => (
              <CommentContainer key={comment._id ? comment._id : comment.dateCreated }>
                <div>
                  {
                    comment.author &&
                    comment.author.avatar &&
                    <img className="avatar" src={comment.author.img} alt="" />
                  }
                  {
                    comment.author &&
                    !comment.author.avatar &&
                    <img className="avatar" className="" src={UserIcon} alt="" />
                  }
                  <label className="name">
                    {`${comment.author.name} ${comment.author.surname}`}
                  </label>
                  <span className="dateCreated">{moment.unix(comment.dateCreated).add((new Date).getTimezoneOffset(), 'minutes').format("DD.MM.yyyy hh:mm")}</span>
                  {
                    !closed &&
                    comment.author._id === userId &&
                    <LinkButton
                    disabled={closed}
                      onClick={(e) => {
                        e.preventDefault();
                        if (editedComment){
                            setEditedComment(null);
                            setEditedCommentBody("");
                        } else {
                          setEditedComment(comment._id ? comment._id : comment.dateCreated);
                        }
                      }}
                      >
                      <img
                        className="icon"
                        style={{width: "1em", marginLeft: "0.3em"}}
                        src={PencilIcon}
                        alt="Pencil icon not found"
                        />
                    </LinkButton>
                  }
                  {
                    !closed &&
                    comment.author._id === userId &&
                    <LinkButton
                    disabled={closed}
                      onClick={(e) => {
                        e.preventDefault();
                        Meteor.call(
                          'comments.removeComment',
                          comment._id
                        );

                        writeHistoryAndSendNotifications(
                          userId,
                          taskId,
                          [REMOVE_COMMENT],
                          [[]],
                          history,
                          assigned,
                          notifications,
                          [[`id__${taskId}__id`]],
                          folder._id,
                          dbUsers,
                        );

                      }}
                      >
                      <img
                        className="icon"
                        style={{width: "1em", marginLeft: "0.3em"}}
                        src={DeleteIcon}
                        alt="Delete icon not found"
                        />
                    </LinkButton>
                  }
                </div>
                {
                  editedComment !== comment._id &&
                  editedComment !== comment.dateCreated &&
                  <p className="body">{comment.body}</p>
                }
                {
                  (editedComment === comment._id || editedComment === comment.dateCreated) &&
                  <Textarea
                    type="text"
                    id="comments"
                    name="comments"
                    placeholder="Comment"
                    disabled={closed}
                    value={editedCommentBody.length > 0 ? editedCommentBody : comment.body}
                    onChange={(e) => {
                      setEditedCommentBody(e.target.value);
                    }}
                    />
                }
                {
                  (editedComment === comment._id || editedComment === comment.dateCreated) &&
                  <ButtonRow style={{padding: "0px"}}>
                    {
                      editedCommentBody &&
                      <LinkButton
                        colour="grey"
                        style={{marginRight: "auto", marginLeft: "0px"}}
                        disabled={closed}
                        onClick={(e) => {
                          e.preventDefault();
                          setEditedCommentBody("");
                        }}
                        >
                        {translations[language].eraseBody}
                      </LinkButton>
                    }
                    <LinkButton
                      colour=""
                      style={{marginLeft: "auto", marginRight: "0px"}}
                      disabled={editedCommentBody.length === 0}
                      onClick={(e) => {
                        e.preventDefault();

                        Meteor.call(
                          'comments.editComment',
                          comment._id,
                          comment.author._id,
                          comment.task,
                          comment.dateCreated,
                          editedCommentBody
                        );

                        writeHistoryAndSendNotifications(
                          userId,
                          taskId,
                          [EDIT_COMMENT],
                          [[]],
                          history,
                          assigned,
                          notifications,
                          [[`id__${taskId}__id`]],
                          folder._id,
                          dbUsers,
                        );

                        setEditedComment(null);
                        setEditedCommentBody("");
                      }}
                      >
                      {translations[language].save}
                      <img
                        className="icon"
                        style={{width: "1em", marginLeft: "0.3em"}}
                        src={SendIcon}
                        alt="Send icon not found"
                        />
                    </LinkButton>
                  </ButtonRow>
                }
              </CommentContainer>
            ))
          }
        </section>
  );
};
