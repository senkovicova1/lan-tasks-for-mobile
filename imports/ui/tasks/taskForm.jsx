import React, {
  useState,
  useMemo,
  useEffect,
} from 'react';
import Select from 'react-select';
import moment from 'moment';
import { useSelector } from 'react-redux';

import { FullStarIcon, EmptyStarIcon, PlusIcon, CloseIcon, SendIcon, UserIcon, DeleteIcon, PencilIcon } from  "/imports/other/styles/icons";

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
  Input,
  InlineInput,
  Textarea,
  List,
  ItemContainer,
  ButtonRow,
  FullButton,
  GroupButton,
  LinkButton,
  CommentContainer
} from "../../other/styles/styledComponents";

const NO_CHANGE = 0;
const ADDED = 1;
const EDITED = 2;
const DELETED = 3;

export default function TaskForm( props ) {

  const {
    match,
    _id: taskId,
    name: taskName,
    important: taskImportant,
    assigned: taskAssigned,
    description: taskDescription,
    deadline: taskDeadline,
    hours: taskHours,
    folder: taskFolder,
    language,
    onSubmit,
    onCancel,
  } = props;

  const folderID = match.params.folderID;

  const userId = Meteor.userId();
  const dbUsers = useSelector((state) => state.users.value);
  const folder = useSelector((state) => state.folders.value).find(f => f._id === folderID);
  const allSubtasks = useSelector((state) => state.subtasks.value);
  const allComments = useSelector((state) => state.comments.value);

  const [ name, setName ] = useState( "" );
  const [ important, setImportant ] = useState( false );
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
  }, [ taskName, taskImportant, taskAssigned, taskDescription, taskDeadline, taskHours, dbUsers, userId ] );

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
      return comment;
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
    switch (e.which || e.keyCode) {
      case 13 :
      break;
    }
  }
  return (
    <Form>

      <section>
        <label htmlFor="name">{translations[language].name}</label>
        <div style={{display: "flex"}}>
          <LinkButton
            onClick={(e) => {
              e.preventDefault();
              setImportant(!important)
            }}
            >
            {
              important &&
              <img
                className="icon star"
                src={FullStarIcon}
                alt="Full star icon not found"
                />
            }
            {
              !important &&
              <img
                className="icon star"
                src={EmptyStarIcon}
                alt="Empty star icon not found"
                />
            }
          </LinkButton>
        <Input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          />
      </div>
      </section>

      <section>
        <label htmlFor="assigned">{translations[language].assigned}</label>
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

      <section>
        <label htmlFor="deadline">{translations[language].deadline}</label>
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

      <section>
        <label htmlFor="hours">{translations[language].hours}</label>
        <Input
          type="number"
          name="hours"
          id="hours"
          placeholder="Hours"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          />
      </section>

{false &&
      <section>
        <label htmlFor="files">{translations[language].files}</label>
            <Input
              id="files"
              name="files"
              type="file"
              onChange={(e) =>  {
                e.persist();
                var file = e.target.files[0];
                if (!file) return;
                var reader = new FileReader();
                reader.onload = e => {
                  var myObj = {
                    name: file.name,
                    data: reader.result.split('base64,')[1]
                  };
                  console.log(URL.createObjectURL(myObj.data));
                };
                reader.readAsDataURL(file);
              }}
              />
            {
              files.map(file => (
                <div key={file.dateCreated}>{file.name}</div>
              ))
            }
      </section>
    }

        <section>
          <label htmlFor="description">{translations[language].description}</label>
          <Textarea
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            />
        </section>

        <section>
          <label htmlFor="subtasks">{translations[language].subtasks}</label>

            <List style={{height: "auto"}}>
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
                      alt="Send icon not found"
                      />
                  </LinkButton>
                }
                </InlineInput>
              }

              {
                displayedSubtasks.length === 0 &&
                <span className="message" style={{margin: "0px"}}>You have no subtasks.</span>
              }

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
                    <Input
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

            </List>
        </section>

        <section>
          <label htmlFor="comments">{translations[language].comments}</label>
          <Textarea
            type="text"
            id="comments"
            name="comments"
            placeholder="Comment"
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
                {translations[language].sendComment}
                <img
                  className="icon"
                  style={{width: "1em", marginLeft: "0.3em"}}
                  src={SendIcon}
                  alt="Send icon not found"
                  />
              </LinkButton>
            </ButtonRow>

            {
              displayedComments.length === 0 &&
              <span className="message" style={{margin: "0px"}}>There are no comments.</span>
            }

            {
              displayedComments.length > 0 &&
              displayedComments.map(comment => (
                <CommentContainer key={comment._id ? comment._id : comment.dateCreated }>
                  <div>
                  {
                    comment.author.avatar &&
                    <img className="avatar" src={comment.author.img} alt="" />
                  }
                  {
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

      <ButtonRow>
        <FullButton colour="grey" onClick={(e) => {e.preventDefault(); onCancel()}}>{translations[language].cancel}</FullButton>
        <FullButton
          colour=""
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
            folderID,
            moment().unix()
          );
        }}
          >
          {translations[language].save}
        </FullButton>
      </ButtonRow>

    </Form>
  );
};
