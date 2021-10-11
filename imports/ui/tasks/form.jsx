import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useSelector
} from 'react-redux';

import Select from 'react-select';

import moment from 'moment';

import {
  Spinner
} from 'reactstrap';

import Datetime from 'react-datetime';

import {
  updateSimpleAttribute
} from './tasksHandlers';

import {
  addNewSubtask,
  editSubtask,
  removeSubtask
} from './subtasksHandlers';

import {
  addNewComment,
  editComment,
  removeComment
} from './commentsHandlers';

import {
  FullStarIcon,
  EmptyStarIcon,
  PlusIcon,
  CloseIcon,
  SendIcon,
  UserIcon,
  DeleteIcon,
  PencilIcon,
  ClockIcon,
  CalendarIcon,
  PaperClipIcon,
  TextIcon
} from "/imports/other/styles/icons";

import {
  selectStyle
} from '/imports/other/styles/selectStyles';

import {
  Form,
  TitleInput,
  TitleCheckbox,
  Input,
  InlineInput,
  HiddenInput,
  Textarea,
  HiddenTextarea,
  List,
  ItemContainer,
  ButtonRow,
  LinkButton,
  CircledButton,
  CommentContainer,
  FileContainer
} from "/imports/other/styles/styledComponents";

import {
  NO_CHANGE,
  ADDED,
  EDITED,
  DELETED
} from '/imports/other/constants';

import {
  uint8ArrayToImg,
} from '/imports/other/helperFunctions';


import {
  translations
} from '/imports/other/translations';

export default function TaskForm( props ) {

  const {
    match,
    _id: taskId,
    closed: taskClosed,
    name: taskName,
    important: taskImportant,
    assigned: taskAssigned,
    description: taskDescription,
    startDatetime: taskStartDatetime,
    endDatetime: taskEndDatetime,
    deadline: taskDeadline,
    hours: taskHours,
    folder,
    files: taskFiles,
    title,
    language,
    onCancel,
  } = props;

  const folderID = match.params.folderID;

  const userId = Meteor.userId();
  const dbUsers = useSelector( ( state ) => state.users.value );
  const allSubtasks = useSelector( ( state ) => state.subtasks.value );
  const allComments = useSelector( ( state ) => state.comments.value );

  const [ name, setName ] = useState( "" );
  const [ important, setImportant ] = useState( false );
  const [ closed, setClosed ] = useState( false );
  const [ assigned, setAssigned ] = useState( "" );
  const [ description, setDescription ] = useState( "" );
  const [ deadline, setDeadline ] = useState( "" );
  const [ startDatetime, setStartDatetime ] = useState( "" );
  const [ endDatetime, setEndDatetime ] = useState( "" );
  const [ hours, setHours ] = useState( "" );

  const [ newSubtaskName, setNewSubtaskName ] = useState( "" );
  const [ openNewSubtask, setOpenNewSubtask ] = useState( false );

  const [ comments, setComments ] = useState( [] );
  const [ newCommentBody, setNewCommentBody ] = useState( "" );
  const [ editedComment, setEditedComment ] = useState( null );
  const [ editedCommentBody, setEditedCommentBody ] = useState( "" );

  const [ files, setFiles ] = useState( [] );
  const [ showSpinner, setShowSpinner ] = useState( false );

  useEffect( () => {

    if ( taskName ) {
      setName( taskName );
    } else {
      setName( "" );
    }

    if ( taskImportant ) {
      setImportant( taskImportant );
    } else {
      setImportant( false );
    }

    if ( taskClosed ) {
      setClosed( taskClosed );
    } else {
      setClosed( false );
    }

    if ( taskAssigned ) {
      setAssigned( taskAssigned );
    } else {
      setAssigned( dbUsers.find( user => user._id === userId ) );
    }

    if ( taskDescription ) {
      setDescription( taskDescription );
    } else {
      setDescription( "" );
    }

    if ( taskStartDatetime ) {
      setStartDatetime( taskStartDatetime );
    } else {
      setStartDatetime( "" );
    }

    if ( !taskEndDatetime && taskDeadline ) {
      setEndDatetime( taskDeadline );
      setDeadline( "" );
    } else {
      setDeadline( "" );
    }

    if ( taskEndDatetime ) {
      setEndDatetime( taskEndDatetime );
    } else {
      setEndDatetime( "" );
    }

    if ( taskHours ) {
      setHours( taskHours );
    } else {
      setHours( "" );
    }

    if ( taskFiles ) {
      setFiles( taskFiles );
    } else {
      setFiles( [] );
    }

  }, [ taskName, taskClosed, taskImportant, taskAssigned, taskDescription, taskDeadline, taskStartDatetime, taskEndDatetime, taskHours, taskFiles, dbUsers, userId ] );

  const subtasks = useMemo( () => {
    return allSubtasks.filter( subtask => subtask.task === taskId );
  }, [ taskId, allSubtasks ] );

  useEffect( () => {
    let newComments = allComments.filter( comment => comment.task === taskId ).map( comment => ( {
      ...comment,
      change: NO_CHANGE
    } ) );
    setComments( newComments );
  }, [ taskId, allComments ] );

  const displayedSubtasks = useMemo( () => {
    return subtasks.filter( subtask => subtask.change !== DELETED ).sort( ( st1, st2 ) => st1.dateCreated < st2.dateCreated ? 1 : -1 );
  }, [ subtasks ] );

  const displayedComments = useMemo( () => {
    return comments.filter( comment => comment.change !== DELETED ).map( comment => {
      const author = dbUsers.find( user => user._id === comment.author );
      if ( author ) {
        return ( {
          ...comment,
          author
        } );
      }
      return ( {
        ...comment,
        author: {}
      } );
    } ).sort( ( st1, st2 ) => st1.dateCreated < st2.dateCreated ? 1 : -1 );
  }, [ comments, dbUsers ] );

  const usersWithRights = useMemo( () => {
    if ( folder ) {
      return folder.users.map( user => {
        let newUser = {
          ...dbUsers.find( u => u._id === user._id ),
          ...user
        };
        return newUser;
      } );
    }
    return [];
  }, [ folder, dbUsers ] );

  document.onkeydown = function( e ) {
    e = e || window.event;
    if ( e.which === 13 || e.keyCode === 13 ) {
      if ( openNewSubtask ) {
        addNewSubtask( newSubtaskName, false, taskId, moment().unix() );
        setNewSubtaskName( "" );
        setOpenNewSubtask( false );
      } else {
        subtasks.forEach( ( subtask, i ) => {
          document.getElementById( `subtask_name ${subtask._id}` ).blur();
        } );
      }
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
    <Form excludeBtn={true}>

      {
        onCancel &&
        <CircledButton
          left={true}
          onClick={(e) => {e.preventDefault(); onCancel()}}
          >
          <img
            className="icon"
            src={CloseIcon}
            alt="Close icon not found"
            />
        </CircledButton>
      }

      <section className="inline" style={{marginTop: "0.3em"}}>
        <TitleCheckbox
          id="task-checked"
          type="checkbox"
          checked={closed}
          onChange={() => {
            const newClosed = !closed;
            setClosed(newClosed);
            updateSimpleAttribute(taskId, {closed: newClosed});
          }}
          />
        <TitleInput
          type="text"
          id="task-title"
          placeholder="Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            updateSimpleAttribute(taskId, {name: e.target.value});
          }}
          />
      </section>

      <section className="inline fit">
        <LinkButton
          style={{color: "#f3d053"}}
          height="fit"
          onClick={(e) => {
            e.preventDefault();
            const newImportant = !important;
            setImportant(newImportant);
            updateSimpleAttribute(taskId, {important: newImportant});
          }}
          >
          {
            important &&
            <img
              style={{margin: "0px"}}
              className="label-icon star"
              src={FullStarIcon}
              alt="Full star icon not found"
              />
          }
          {
            !important &&
            <img
              style={{margin: "0px"}}
              className="label-icon star"
              src={EmptyStarIcon}
              alt="Empty star icon not found"
              />
          }
          <span style={{marginLeft: "10px"}}>
            Important
          </span>
        </LinkButton>
      </section>

      <section className="inline">
        <span className="icon-container">
          <img
            className="label-icon"
            htmlFor="assigned"
            src={UserIcon}
            alt="User icon not found"
            />
        </span>
        <div style={{width: "100%"}}>
          <Select
            id="assigned"
            name="assigned"
            styles={selectStyle}
            value={assigned}
            onChange={(e) => {
              setAssigned(e);
              updateSimpleAttribute(taskId, {assigned: e.value});
            }}
            options={usersWithRights}
            />
        </div>
      </section>

      <section className="inline">
        <span className="icon-container">
          <img
            className="label-icon"
            htmlFor="deadline"
            src={CalendarIcon}
            alt="Calendar icon not found"
            />
        </span>
          <Datetime
            className="full-width m-r-03"
            dateFormat={"DD.MM.yyyy"}
            value={startDatetime ? moment.unix(startDatetime) : ""}
            timeFormat={false}
            name="startDate"
            id="startDate"
            inputProps={{
              placeholder: 'Set date',
            }}
            onChange={(date) => {
              if (typeof date !== "string"){
                  setStartDatetime(date.unix());
                  updateSimpleAttribute(taskId, {startDatetime: date.unix()});
              } else {
                  setStartDatetime(date);
                  updateSimpleAttribute(taskId, {startDatetime: date});
              }
            }}
            renderInput={(props) => {
                return <Input
                  {...props}
                   value={startDatetime ? props.value : ''}
                  />
            }}
            />
            <Datetime
              className="full-width m-r-03"
              dateFormat={false}
              value={startDatetime ? moment.unix(startDatetime) : ""}
              timeFormat={"HH:mm"}
              name="startTime"
              id="startTime"
              inputProps={{
              placeholder: 'Set time',
              }}
              onChange={(date) => {
                if (typeof date !== "string"){
                    setStartDatetime(date.unix());
                    updateSimpleAttribute(taskId, {startDatetime: date.unix()});
                } else {
                    setStartDatetime(date);
                    updateSimpleAttribute(taskId, {startDatetime: date});
                }
              }}
              renderInput={(props) => {
                return <Input
                  {...props}
                   value={startDatetime ? props.value : ''}
                  />
              }}
              />
            <LinkButton
              style={{height: "40px", marginRight: "0.6em"}}
              height="fit"
              onClick={(e) => {
                e.preventDefault();
                setStartDatetime("");
                updateSimpleAttribute(taskId, {startDatetime: ""});
              }}
              >
                <img
                  style={{margin: "0px"}}
                  className="icon"
                  src={CloseIcon}
                  alt="CloseIcon star icon not found"
                  />
            </LinkButton>
            <span className="icon-container">
              End
            </span>
              <Datetime
                className="full-width m-r-03"
                dateFormat={"DD.MM.yyyy"}
                value={endDatetime ? moment.unix(endDatetime) : ""}
                timeFormat={false}
                name="endDate"
                id="endDate"
                inputProps={{
                placeholder: 'Set date',
                }}
                onChange={(date) => {
                  if (typeof date !== "string"){
                      setEndDatetime(date.unix());
                      updateSimpleAttribute(taskId, {endDatetime: date.unix()});
                  } else {
                      setEndDatetime(date);
                      updateSimpleAttribute(taskId, {endDatetime: date});
                  }
                }}
                renderInput={(props) => {
                    return <Input
                      {...props}
                       value={endDatetime ? props.value : ''}
                      />
                }}
                />
                <Datetime
                  className="full-width m-r-03"
                  dateFormat={false}
                  value={endDatetime ? moment.unix(endDatetime) : ""}
                  timeFormat={"HH:mm"}
                  name="endTime"
                  id="endTime"
                  inputProps={{
                    placeholder: 'Set time',
                  }}
                  onChange={(date) => {
                    if (typeof date !== "string"){
                        setEndDatetime(date.unix());
                        updateSimpleAttribute(taskId, {endDatetime: date.unix()});
                    } else {
                        setEndDatetime(date);
                        updateSimpleAttribute(taskId, {endDatetime: date});
                    }
                  }}
                  renderInput={(props) => {
                      return <Input
                        {...props}
                         value={endDatetime ? props.value : ''}
                        />
                  }}
                  />
                <LinkButton
                  style={{ height: "40px"}}
                  height="fit"
                  onClick={(e) => {
                    e.preventDefault();
                    setEndDatetime("");
                    if (deadline) {
                      setDeadline(null);
                      updateSimpleAttribute(taskId, {deadline: null});
                    }
                    updateSimpleAttribute(taskId, {endDatetime: ""});
                  }}
                  >
                    <img
                      style={{margin: "0px"}}
                      className="icon"
                      src={CloseIcon}
                      alt="CloseIcon star icon not found"
                      />
                </LinkButton>
      </section>

      <section className="inline">
        <span className="icon-container">
          <img
            className="label-icon"
            htmlFor="hours"
            src={ClockIcon}
            alt="Clock icon not found"
            />
        </span>
        <Input
          type="number"
          name="hours"
          id="hours"
          placeholder="Hours"
          value={hours}
          onChange={(e) => {
            setHours(e.target.value);
            updateSimpleAttribute(taskId, {hours: e.target.value});
          }}
          />
      </section>

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
          placeholder="Write description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            updateSimpleAttribute(taskId, {description: e.target.value});
          }}
          />
      </section>

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
                  onClick={(e) => {
                    e.preventDefault();
                    updateSimpleAttribute(taskId, {files: files.filter(f => f.dateCreated !== file.dateCreated)});
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
          <Input
            id="files"
            name="files"
            type="file"
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
                updateSimpleAttribute(taskId, {files: [...files, newFile]});
              };
              reader.readAsDataURL(file);
            }}
            />
        </div>
      </section>

      <section className="subtasks">
        <label htmlFor="subtasks">{translations[language].subtasks}</label>

        <List style={{height: "auto"}}>
          {
            displayedSubtasks.length > 0 &&
            displayedSubtasks.map((subtask) => (
              <ItemContainer
                style={{padding: "0px", margin: "0px"}}
                key={subtask._id ? subtask._id : subtask.dateCreated}
                >
                <Input
                  id={`subtask_closed ${subtask._id}`}
                  type="checkbox"
                  checked={subtask.closed}
                  onChange={() =>  editSubtask(subtask._id, subtask.name, !subtask.closed, subtask.task, subtask.dateCreated)}
                  />
                <HiddenInput
                  id={`subtask_name ${subtask._id}`}
                  type="text"
                  value={subtask.name}
                  onChange={(e) => editSubtask(subtask._id, e.target.value, subtask.closed, subtask.task, subtask.dateCreated)}
                  />

                <LinkButton
                  onClick={(e) => {
                    e.preventDefault();
                    removeSubtask(subtask._id);
                  }}
                  >
                  <img
                    className="icon"
                    src={CloseIcon}
                    alt="Close icon not found"
                    />
                </LinkButton>
              </ItemContainer>
            ))
          }
          {
            !openNewSubtask &&
            <InlineInput style={{padding: "0px"}}>
              <LinkButton onClick={(e) => {e.preventDefault(); setOpenNewSubtask(true);}}>
                <img
                  className="icon"
                  style={{marginLeft: "0px", marginRight: "0.8em", height: "1.3em"}}
                  src={PlusIcon}
                  alt="Plus icon not found"
                  />
                Subtask
              </LinkButton>
            </InlineInput>
          }

          {
            openNewSubtask &&
            <InlineInput
              style={{padding: "0px"}}
              >
              <input
                id={`add-task`}
                type="text"
                placeholder="New task"
                value={newSubtaskName}
                onChange={(e) => setNewSubtaskName(e.target.value)}
                />
              <LinkButton
                onClick={(e) => {e.preventDefault(); setOpenNewSubtask(false);}}
                className="connected-btn"
                >
                <img
                  className="icon"
                  src={CloseIcon}
                  alt="Close icon not found"
                  />
              </LinkButton>

              <LinkButton
                onClick={(e) => {
                  e.preventDefault();
                  addNewSubtask(newSubtaskName, false, taskId, moment().unix());
                  setNewSubtaskName("");
                  setOpenNewSubtask(false);
                }}
                >
                <img
                  className="icon"
                  src={SendIcon}
                  style={{marginLeft: "0px", marginRight: "0.3em", width: "1.6em"}}
                  alt="Send icon not found"
                  />
              </LinkButton>
            </InlineInput>
          }
        </List>
      </section>

      <section className="comments">
        <HiddenTextarea
          type="text"
          id="comments"
          name="comments"
          placeholder="Write a comment"
          value={newCommentBody}
          onChange={(e) => setNewCommentBody(e.target.value)}
          />
        <ButtonRow>
          {newCommentBody.length > 0 &&
            <LinkButton colour="grey" onClick={(e) => {e.preventDefault(); setNewCommentBody("")}}>{translations[language].eraseBody}</LinkButton>
          }
          <LinkButton
            colour=""
            style={{marginLeft: "auto", marginRight: "0px"}}
            disabled={newCommentBody.length === 0}
            onClick={(e) => {
              e.preventDefault();
              addNewComment(userId, taskId, moment().unix(), newCommentBody);
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
                  comment.author._id === userId &&
                  <LinkButton
                    onClick={(e) => {
                      e.preventDefault();
                      setEditedComment(comment._id ? comment._id : comment.dateCreated);
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
                  comment.author._id === userId &&
                  <LinkButton
                    onClick={(e) => {
                      e.preventDefault();
                      removeComment(comment._id);
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
                  value={editedCommentBody.length > 0 ? editedCommentBody : comment.body}
                  onChange={(e) => {
                    setEditedCommentBody(e.target.value);
                  }}
                  />
              }
              {
                (editedComment === comment._id || editedComment === comment.dateCreated) &&
                <ButtonRow>
                  {
                    editedCommentBody &&
                    <LinkButton colour="grey" onClick={(e) => {e.preventDefault(); setNewCommentBody("")}}>{translations[language].eraseBody}</LinkButton>
                  }
                  <LinkButton
                    colour=""
                    style={{marginLeft: "auto", marginRight: "0px"}}
                    disabled={editedCommentBody.length === 0}
                    onClick={(e) => {
                      e.preventDefault();
                      editComment(comment._id, comment.author._id, comment.task, comment.dateCreated, editedCommentBody);
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
    </Form>
  );
};
