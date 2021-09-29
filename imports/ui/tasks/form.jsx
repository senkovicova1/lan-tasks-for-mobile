import React, {
  useState,
  useMemo,
  useEffect,
} from 'react';
import Select from 'react-select';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { Spinner } from 'reactstrap';

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
} from '../../other/styles/selectStyles';

import {
  translations,
  uint8ArrayToImg
} from '../../other/translations.jsx';

import {
  Form,
  FormTable,
  TitleInput,
  Input,
  InlineInput,
  HiddenInput,
  Textarea,
  HiddenTextarea,
  List,
  ItemContainer,
  ButtonRow,
  FullButton,
  GroupButton,
  LinkButton,
  CommentContainer,
  FileContainer
} from "../../other/styles/styledComponents";

const NO_CHANGE = 0;
const ADDED = 1;
const EDITED = 2;
const DELETED = 3;

export default function TaskForm( props ) {

  const {
    match,
    _id: taskId,
    closed: taskClosed,
    name: taskName,
    important: taskImportant,
    assigned: taskAssigned,
    description: taskDescription,
    deadline: taskDeadline,
    hours: taskHours,
    folder,
    files: taskFiles,
    title,
    language,
    onSubmit,
    onCancel,
  } = props;

  const folderID = match.params.folderID;

  const userId = Meteor.userId();
  const dbUsers = useSelector((state) => state.users.value);
  const allSubtasks = useSelector((state) => state.subtasks.value);
  const allComments = useSelector((state) => state.comments.value);

  const [ name, setName ] = useState( "" );
  const [ important, setImportant ] = useState( false );
  const [ closed, setClosed ] = useState( false );
  const [ assigned, setAssigned ] = useState( "" );
  const [ description, setDescription ] = useState( "" );
  const [ deadline, setDeadline ] = useState( "" );
  const [ hours, setHours ] = useState( "" );

  const [ subtasks, setSubtasks ] = useState( [] );
  const [ newSubtaskName, setNewSubtaskName ] = useState("");
  const [ openNewSubtask, setOpenNewSubtask ] = useState(false);

  const [ comments, setComments ] = useState( [] );
  const [ newCommentBody, setNewCommentBody ] = useState("");
  const [ editedComment, setEditedComment ] = useState(null);
  const [ editedCommentBody, setEditedCommentBody ] = useState("");

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
      setAssigned( dbUsers.find(user => user._id === userId ) );
    }
    if ( taskDescription ) {
      setDescription( taskDescription );
    } else {
      setDescription( "" );
    }
    if ( taskDeadline ) {
      setDeadline( taskDeadline );
    } else {
      setDeadline( "" );
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
  }, [ taskName, taskClosed, taskImportant, taskAssigned, taskDescription, taskDeadline, taskHours, taskFiles, dbUsers, userId ] );

  useEffect( () => {
    let newSubtasks = allSubtasks.filter(subtask => subtask.task === taskId).map(subtask => ({...subtask, change: NO_CHANGE}));
    setSubtasks(newSubtasks);
  }, [ taskId, allSubtasks ] );

  useEffect( () => {
      let newComments = allComments.filter(comment => comment.task === taskId).map(comment => ({...comment, change: NO_CHANGE }));
      setComments(newComments);
  }, [ taskId, allComments ] );

  const displayedSubtasks = useMemo(() => {
    return subtasks.filter(subtask => subtask.change !== DELETED).sort((st1, st2) => st1.dateCreated < st2.dateCreated ? 1 : -1);
  }, [subtasks]);

  const displayedComments = useMemo(() => {
    return comments.filter(comment => comment.change !== DELETED).map(comment => {
      const author = dbUsers.find(user => user._id === comment.author);
      if (author){
        return ({...comment, author});
      }
      return ({...comment, author: {}});
    }).sort((st1, st2) => st1.dateCreated < st2.dateCreated ? 1 : -1);
  }, [comments, dbUsers]);

  const usersWithRights = useMemo(() => {
    if (folder){
      return folder.users.map(user =>
        {
          let newUser = {...dbUsers.find(u => u._id === user._id), ...user};
          return newUser;
        });
      }
      return [];
    }, [folder, dbUsers]);

  document.onkeydown = function (e) {
    e = e || window.event;
    if (e.which === 13 || e.keyCode === 13){
      if (newSubtaskName.length > 0){
        const newSubtask = {
          name: newSubtaskName,
          task: taskId,
          closed: false,
          dateCreated: moment().unix(),
          change: ADDED,
        }
        setSubtasks([...subtasks, newSubtask]);
        setNewSubtaskName("");
        setOpenNewSubtask(false);
      } else {
        subtasks.forEach((subtask, i) => {
          document.getElementById(  `subtask_name ${subtask._id}`).blur();
        });
      }
    }
  }

  return (
    <Form>
      <ButtonRow>
        {onCancel &&
          <FullButton right={true} width={"150px"} colour="grey" onClick={(e) => {e.preventDefault(); onCancel()}}>{translations[language].cancel}</FullButton>
        }
        <FullButton
          colour=""
          width={"150px"}
          disabled={name.length === 0}
          onClick={(e) => {
            e.preventDefault();
            onSubmit(
              name,
              important,
              assigned._id,
              deadline,
              hours,
              description,
              subtasks,
              comments,
              files,
              folderID,
              moment().unix()
            );
          }}
          >
          {translations[language].save}
        </FullButton>
      </ButtonRow>

      <section className="attribute">
        <TitleInput
          id={`task-checked`}
          type="checkbox"
          checked={closed}
          onChange={() => {
            setClosed(!closed)
          }}
          />
        <TitleInput
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          />
      </section>

      <section className="attribute">
      <LinkButton
        style={{color: "#f3d053"}}
        onClick={(e) => {
          e.preventDefault();
          setImportant(!important)
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
        Important
      </LinkButton>
      </section>

      <section className="attribute">
        <span className="icon-container">
          <img
            className="label-icon"
            htmlFor="assigned"
            src={UserIcon}
            alt="User icon not found"
            />
        </span>
        <Select
          id="assigned"
          name="assigned"
          styles={selectStyle}
          value={assigned}
          onChange={(e) => {
            setAssigned(e);
          }}
          options={usersWithRights}
          />
      </section>

      <section className="attribute">
        <span className="icon-container">
          <img
            className="label-icon"
            htmlFor="deadline"
            src={CalendarIcon}
            alt="Calendar icon not found"
            />
        </span>
        <Input
          type="datetime-local"
          name="deadline"
          id="deadline"
          placeholder="Deadline"
          value={deadline ? moment.unix(deadline).add((new Date).getTimezoneOffset(), 'minutes').format("yyyy-MM-DD hh:mm").replace(" ", "T") : ""}
          min={moment.unix().add((new Date).getTimezoneOffset(), 'minutes').format("yyyy-MM-DD hh:mm").replace(" ", "T")}
          onChange={(e) => setDeadline(e.target.valueAsNumber/1000)}
          />
      </section>

      <section className="attribute">
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
          onChange={(e) => setHours(e.target.value)}
          />
      </section>

      <section className="attribute">
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
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          />
      </section>

      <section className="attribute">
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
                      onClick={(e) => {e.preventDefault(); setFiles(files.filter(f => f.dateCreated !== file.dateCreated))}}
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
                  setFiles([...files, newFile]);
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
                      onChange={() => {
                        const newSubtasks = subtasks.map(st => {
                          if (st._id && st._id === subtask._id){
                            return ({...st, closed: !st.closed, change: EDITED});
                          } else if (st.name === subtask.name && st.dateCreated === subtask.dateCreated){
                            return ({...st, closed: !st.closed});
                          }
                          return st;
                        });
                        setSubtasks(newSubtasks);
                      }}
                      />
                    <HiddenInput
                        id={`subtask_name ${subtask._id}`}
                        type="text"
                        value={subtask.name}
                        onChange={(e) => {
                          const newSubtasks = subtasks.map(st => {
                            if (st._id && st._id === subtask._id){
                              return ({...st, name: e.target.value, change: EDITED});
                            } else if (st.name === subtask.name && st.dateCreated === subtask.dateCreated){
                              return ({...st, name: e.target.value});
                            }
                            return st;
                          })
                          setSubtasks(newSubtasks);
                        }}
                        />

                    <LinkButton
                      onClick={(e) => {
                        e.preventDefault();
                        const newSubtasks = subtasks.map(st => {
                          if (st._id && st._id === subtask._id){
                            return ({...st, change: DELETED});
                          } else if (st.name === subtask.name && st.dateCreated === subtask.dateCreated){
                            return null;
                          }
                          return st;
                        });
                        setSubtasks(newSubtasks.filter(st => st));
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

                  {
                    newSubtaskName.length > 0 &&
                    <LinkButton
                      onClick={(e) => {
                        e.preventDefault();
                        const newSubtask = {
                          name: newSubtaskName,
                          task: taskId,
                          closed: false,
                          dateCreated: moment().unix(),
                          change: ADDED,
                        }
                        setSubtasks([...subtasks, newSubtask]);
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
                  }
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
                  const newComment = {
                    author: userId,
                    task: taskId,
                    dateCreated: moment().unix(),
                    body: newCommentBody,
                    change: ADDED,
                  }
                  setComments([...comments, newComment]);
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
                          const newComments = comments.map(c => {
                            if (c._id && c._id === comment._id){
                              return ({...c, change: DELETED});
                            } else if (c.body === comment.body && c.dateCreated === comment.dateCreated){
                              return null;
                            }
                            return c;
                          });
                          setComments(newComments.filter(c => c));
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
                              const newComments = comments.map(c => {
                                if (c._id && c._id === comment._id){
                                  return ({...c, body: editedCommentBody, change: EDITED});
                                } else if (c.dateCreated === comment.dateCreated){
                                  return ({...c, body: editedCommentBody});
                                }
                                return c;
                              })
                              setComments(newComments);
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
