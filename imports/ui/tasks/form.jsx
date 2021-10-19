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
  EmptyStarIcon,
  FullStarIcon,
  FolderIcon,
  PlusIcon,
  CloseIcon,
  SendIcon,
  UserIcon,
  DeleteIcon,
  PencilIcon,
  ClockIcon,
  CalendarIcon,
  PaperClipIcon,
  TextIcon,
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
  FileContainer,
  FullButton,
  ButtonCol,
  DatetimePicker
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
    allDay: taskAllDay,
    startDatetime: taskStartDatetime,
    endDatetime: taskEndDatetime,
    deadline: taskDeadline,
    hours: taskHours,
    folder: taskFolder,
    container: taskContainer,
    files: taskFiles,
    title,
    language,
    addNewTask,
    onCancel,
  } = props;

  const folderID = match.params.folderID;

  const userId = Meteor.userId();
  const dbUsers = useSelector( ( state ) => state.users.value );
  const allSubtasks = useSelector( ( state ) => state.subtasks.value );
  const allComments = useSelector( ( state ) => state.comments.value );
  const folders = useSelector( ( state ) => state.folders.value ).active;

  const [ name, setName ] = useState( "" );
  const [ important, setImportant ] = useState( false );
  const [ folder, setFolder ] = useState( null );
  const [ container, setContainer ] = useState( null );
  const [ closed, setClosed ] = useState( false );
  const [ assigned, setAssigned ] = useState( [] );
  const [ description, setDescription ] = useState( "" );
  const [ deadline, setDeadline ] = useState( "" );
  const [ allDay, setAllDay ] = useState( false );
  const [ startDatetime, setStartDatetime ] = useState( "" );
  const [ endDatetime, setEndDatetime ] = useState( "" );
  const [ possibleStartDatetime, setPossibleStartDatetime ] = useState( "" );
  const [ possibleEndDatetime, setPossibleEndDatetime ] = useState( "" );
  const [ openDatetime, setOpenDatetime ] = useState( false );
  const [ hours, setHours ] = useState( "" );

  const [ addedSubtasks, setAddedSubtasks ] = useState( [] );
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

    if ( taskFolder ) {
      setFolder( taskFolder );

      if ( taskContainer ) {
        const container = taskFolder.containers ? taskFolder.containers.find(container => container._id === taskContainer) : null;
        setContainer( container ? {...container, value: container._id} : null );
      } else {
        setContainer( null );
      }
    } else {
      setFolder( null );
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
      setAssigned( [dbUsers.find( user => user._id === userId )] );
    }

    if ( taskDescription ) {
      setDescription( taskDescription );
    } else {
      setDescription( "" );
    }

    if ( taskAllDay ) {
      setAllDay( taskAllDay );
    } else {
      setAllDay( false );
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

  }, [ taskName, taskFolder, taskContainer, taskClosed, taskImportant, taskAssigned, taskDescription, taskDeadline, taskAllDay, taskStartDatetime, taskEndDatetime, taskHours, taskFiles, dbUsers, userId ] );

  useEffect(() => {
    if (startDatetime){
      setPossibleStartDatetime(startDatetime);
    }
    if (endDatetime){
      setPossibleEndDatetime(endDatetime);
    }
    if (!startDatetime) {
      setPossibleStartDatetime(moment().add(1, 'days').unix());
      setPossibleEndDatetime(moment().add(1, 'days').add(30, 'minutes').unix());
    }
  }, [openDatetime]);

  const subtasks = useMemo( () => {
    return allSubtasks.filter( subtask => subtask.task === taskId );
  }, [ taskId, allSubtasks ] );

  const containers = useMemo( () => {
    if (folder){
      return folder.containers && folder.containers.length > 0 ? [{value: 0, _id: 0, label: "New"}, ...folder.containers.map(container => ({...container, vlaue: container._id}))] : [{value: 0, _id: 0, label: "New"}];
    }
    return [{value: 0, _id: 0, label: "New"}];
  }, [ taskId, folder ] );

  useEffect( () => {
    let newComments = allComments.filter( comment => comment.task === taskId ).map( comment => ( {
      ...comment,
      change: NO_CHANGE
    } ) );
    setComments( newComments );
  }, [ taskId, allComments ] );

  const displayedSubtasks = useMemo( () => {
    return addedSubtasks.length > 0 ? addedSubtasks.sort( ( st1, st2 ) => st1.dateCreated < st2.dateCreated ? 1 : -1 ) : subtasks.filter( subtask => subtask.change !== DELETED ).sort( ( st1, st2 ) => st1.dateCreated < st2.dateCreated ? 1 : -1 );
  }, [ subtasks, addedSubtasks ] );

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

  const hoursAndMinutes = () => {
    let options = [];
    for (var h = 0; h < 24; h++) {
      for (var m = 0; m < 59; m = m+15) {
        options.push({label: `${h}:${m}`, value: `${h}:${m}`, hours: h, minutes: m});
      }
    }
    return options;
  };

  document.onkeydown = function( e ) {
    e = e || window.event;
    if ( e.which === 13 || e.keyCode === 13 ) {
      if ( openNewSubtask ) {
        if (!addNewTask){
          addNewSubtask( newSubtaskName, false, taskId, moment().unix() );
        } else{
          setAddedSubtasks([...addedSubtasks, {change: ADDED, name: newSubtaskName, closed: false, dateCreated: moment().unix()}]);
        }
        setNewSubtaskName( "" );
        setOpenNewSubtask( false );
      } else {
        subtasks.forEach( ( subtask, i ) => {
          document.getElementById( `subtask_name ${subtask._id}` ).blur();
        } );
        addedSubtasks.forEach( ( subtask, i ) => {
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
            if (!addNewTask){
              updateSimpleAttribute(taskId, {closed: newClosed});
            }
          }}
          />
        <TitleInput
          type="text"
          id="task-title"
          placeholder="Name"
          value={name}
          disabled={closed}
          onChange={(e) => {
            setName(e.target.value);
            if ( !addNewTask ) {
              updateSimpleAttribute( taskId, {
                name: e.target.value
              } );
            }
          }}
          />
      </section>

      <section className="inline fit">
        <LinkButton
          style={{color: "#f3d053"}}
          height="fit"
          disabled={closed}
          onClick={(e) => {
            e.preventDefault();
            const newImportant = !important;
            setImportant(newImportant);
            if ( !addNewTask ) {
            updateSimpleAttribute(taskId, {important: newImportant});
          }
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

      {
        addNewTask &&
      <section className="inline">
        <span className="icon-container">
          <img
            className="label-icon"
            htmlFor="assigned"
            src={FolderIcon}
            alt="FolderIcon icon not found"
            />
        </span>
        <div style={{width: "100%"}}>
          <Select
            id="folder"
            name="folder"
            isDisabled={closed}
            styles={selectStyle}
            value={folder}
            onChange={(e) => {
              setFolder(e);
            }}
            options={folders}
            />
        </div>
      </section>
    }

    <section className="inline">
      <span className="icon-container">
        <img
          className="label-icon"
          htmlFor="container"
          src={FolderIcon}
          alt="FolderIcon icon not found"
          />
      </span>
      <div style={{width: "100%"}}>
        <Select
          id="container"
          name="container"
          styles={selectStyle}
          isDisabled={closed}
          value={container ? container : {value: 0, _id: 0, label: "New"}}
          onChange={(e) => {
            setContainer(e);
            if ( !addNewTask ) {
              updateSimpleAttribute(taskId, {container: e._id});
            }
          }}
          options={containers}
          />
      </div>
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
            isMulti
            value={assigned}
            isDisabled={closed}
            onChange={(e) => {
              setAssigned(e);
              if ( !addNewTask ) {
              updateSimpleAttribute(taskId, {assigned: e.map(user => user._id)});
            }
            }}
            options={usersWithRights}
            />
        </div>
      </section>

      {
        !openDatetime &&
      <section className="inline">
        <span className="icon-container">
          <img
            className="label-icon"
            htmlFor="deadline"
            src={CalendarIcon}
            alt="Calendar icon not found"
            />
        </span>
        <span
          className="datetime-span"
          onClick={() => setOpenDatetime(true)}
          >
        <span>
          {
            !startDatetime &&
            !endDatetime &&
            "Set scheduled"
          }
          {
            (startDatetime || endDatetime) &&
            !allDay &&
            `${moment.unix(startDatetime).format("D.M.YYYY HH:mm")} - ${moment.unix(endDatetime).format("HH:mm")}`
          }
          {
            (startDatetime || endDatetime) &&
            allDay &&
            `${moment.unix(startDatetime).format("D.M.YYYY")} - ${moment.unix(endDatetime).format("D.M.YYYY")}`
          }
        </span>
        <LinkButton
          style={{height: "40px", marginLeft: "auto"}}
          className="left"
          height="fit"
          disabled={closed}
          onClick={(e) => {
            e.preventDefault();
            setStartDatetime("");
            setStartDatetime("");
            if ( !addNewTask ) {
              updateSimpleAttribute(taskId, {startDatetime: "", endDatetime: ""});
            }
          }}
          >
            <img
              style={{margin: "0px"}}
              className="icon"
              src={CloseIcon}
              alt="CloseIcon star icon not found"
              />
        </LinkButton>
      </span>
      </section>
    }

        {
          openDatetime &&
          <div style={{position: "relative"}}>
          <DatetimePicker>
            <section>
            <h3>Set scheduled</h3>
          </section>
          <section className="inline">
              {
                allDay &&
                <span className="icon-container" style={{width: "45px", justifyContent: "center"}}>
                From:
                </span>
              }
                  {
                    !allDay &&
                    <span className="icon-container" style={{width: "45px", justifyContent: "center"}}>
                    Date:
                    </span>
                  }
              <Datetime
                className="full-width"
                dateFormat={"DD.MM.yyyy"}
                value={possibleStartDatetime ? moment.unix(possibleStartDatetime) : possibleStartDatetime}
                timeFormat={false}
                name="startDate"
                id="startDate"
                inputProps={{
                  placeholder: 'Set date',
                }}
                onChange={(date) => {
                  if (typeof date !== "string"){
                      const newYear = date.year();
                      const newMonth = date.month();
                      const newDay = date.date();
                      const newEndDatetime = moment(endDatetime*1000).year(newYear).month(newMonth).date(newDay);
                      setPossibleStartDatetime(date.unix());
                      setPossibleEndDatetime(newEndDatetime.unix());

                  /*    if ( !addNewTask ) {
                        updateSimpleAttribute(taskId, {startDatetime: date.unix(), endDatetime: newEndDatetime.unix()});
                      }*/
                  } else {
                      setPossibleStartDatetime(date);

                /*      if ( !addNewTask ) {
                        updateSimpleAttribute(taskId, {startDatetime: date, endDatetime: date});
                      }*/
                  }
                }}
                renderInput={(props) => {
                    return <Input
                      {...props}
                      disabled={closed}
                      value={possibleStartDatetime ? props.value : ''}
                      />
                }}
                />
                <LinkButton
                  style={{height: "40px", marginRight: "0.6em", marginLeft: "0.6em"}}
                  height="fit"
                  disabled={closed}
                  onClick={(e) => {
                    e.preventDefault();
                    setPossibleStartDatetime("");
            /*        if ( !addNewTask ) {
                      updateSimpleAttribute(taskId, {startDatetime: "", endDatetime: ""});
                    }*/
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
              {
                !allDay &&
                <section className="inline">
                  <span className="icon-container" style={{width: "45px", justifyContent: "center"}}>
                    From:
                  </span>

                  <div style={{width: "100%"}}>
                    <Select
                      name="startTime"
                      id="startTime"
                      isDisabled={closed}
                      styles={selectStyle}
                      value={possibleStartDatetime ? {label: `${moment(possibleStartDatetime*1000).hours()}:${moment(possibleStartDatetime*1000).minutes()}`, value: `${moment(possibleStartDatetime*1000).hours()}:${moment(possibleStartDatetime*1000).minutes()}`, hours: moment(possibleStartDatetime*1000).hours(), minutes: moment(possibleStartDatetime*1000).minutes()} : null}
                      placeholder={"Set time"}
                      onChange={(e) => {
                        const newStartDatetime = moment(possibleStartDatetime*1000).hours(e.hours).minutes(e.minutes);
                        if (typeof newStartDatetime !== "string"){
                            setPossibleStartDatetime(newStartDatetime.unix());
                      /*      if ( !addNewTask ) {
                              updateSimpleAttribute(taskId, {startDatetime: newStartDatetime.unix()});
                            }*/
                        } else {
                            setPossibleStartDatetime(newStartDatetime);
                        /*    if ( !addNewTask ) {
                              updateSimpleAttribute(taskId, {startDatetime: newStartDatetime});
                            }*/
                        }
                      }}
                      options={hoursAndMinutes()}
                      />
                  </div>

                <LinkButton
                  style={{height: "40px", marginRight: "0.6em", marginLeft: "0.6em"}}
                  height="fit"
                  disabled={closed}
                  onClick={(e) => {
                    e.preventDefault();
                    const newHour = 0;
                    const newMinute = 0;
                    const newSecond = 0;
                    const newStartDatetime = moment(possibleStartDatetime*1000).hour(newHour).minute(newMinute).second(newSecond);
                    setPossibleStartDatetime(newStartDatetime.unix());

              /*      if ( !addNewTask ) {
                      updateSimpleAttribute(taskId, {startDatetime: newStartDatetime.unix()});
                    }*/
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
              }
                {
                  !allDay &&
                  <section className="inline">
                    <span className="icon-container" style={{width: "45px", justifyContent: "center"}}>
                      To:
                    </span>
                    <div style={{width: "100%"}}>
                      <Select
                        name="endTime"
                        id="endTime"
                        isDisabled={closed}
                        styles={selectStyle}
                        value={possibleEndDatetime ? {label: `${moment(possibleEndDatetime*1000).hours()}:${moment(possibleEndDatetime*1000).minutes()}`, value: `${moment(possibleEndDatetime*1000).hours()}:${moment(possibleEndDatetime*1000).minutes()}`, hours: moment(possibleEndDatetime*1000).hours(), minutes: moment(possibleEndDatetime*1000).minutes()} : null}
                        placeholder={"Set time"}
                        onChange={(e) => {
                          let newEndDatetime = moment(possibleEndDatetime*1000).hours(e.hours).minutes(e.minutes);
                          if (typeof newEndDatetime !== "string"){
                              setPossibleEndDatetime(newEndDatetime.unix());
                      /*        if ( !addNewTask ) {
                                updateSimpleAttribute(taskId, {endDatetime: newEndDatetime.unix()});
                              }*/
                          } else {
                              setPossibleEndDatetime(newEndDatetime);
                      /*        if ( !addNewTask ) {
                                updateSimpleAttribute(taskId, {endDatetime: newEndDatetime});
                              }*/
                          }
                        }}
                        options={hoursAndMinutes()}
                        />
                    </div>

                  <LinkButton
                    style={{height: "40px", marginRight: "0.6em", marginLeft: "0.6em"}}
                    height="fit"
                    disabled={closed}
                    onClick={(e) => {
                      e.preventDefault();
                      const newHour = 0;
                      const newMinute = 0;
                      const newSecond = 0;
                      const newEndDatetime = moment(possibleEndDatetime*1000).hour(newHour).minute(newMinute).second(newSecond);
                      setPossibleEndDatetime(newEndDatetime.unix());
                  /*    if ( !addNewTask ) {
                        updateSimpleAttribute(taskId, {endDatetime: newEndDatetime.unix()});
                      }*/
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
                }
                {
                  allDay &&
                  <section className="inline">
                    <span className="icon-container" style={{width: "45px", justifyContent: "center"}}>
                      To:
                    </span>
                  <Datetime
                    className="full-width"
                    dateFormat={"DD.MM.yyyy"}
                    value={moment.unix(possibleEndDatetime)}
                    timeFormat={false}
                    name="endDate"
                    id="endDate"
                    inputProps={{
                    placeholder: 'Set date',
                    }}
                    onChange={(date) => {
                      if (typeof date !== "string"){
                          setPossibleEndDatetime(date.unix());
                    /*      if ( !addNewTask ) {
                            updateSimpleAttribute(taskId, {endDatetime: date.unix()});
                          }*/
                      } else {
                          setPossibleEndDatetime(date);
                          if ( !addNewTask ) {
                            updateSimpleAttribute(taskId, {endDatetime: date});
                          }
                      }
                    }}
                    renderInput={(props) => {
                        return <Input
                          {...props}
                          disabled={closed}
                           value={endDatetime ? props.value : ''}
                          />
                    }}
                    />
                  <LinkButton
                    style={{height: "40px", marginRight: "0.6em", marginLeft: "0.6em"}}
                    height="fit"
                    disabled={closed}
                    onClick={(e) => {
                      e.preventDefault();
                      setPossibleEndDatetime(possibleStartDatetime);
                /*      if ( !addNewTask ) {
                        updateSimpleAttribute(taskId, {endDatetime: startDatetime});
                      }*/
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
                }

          <section>
            <Input
              id='taskAllDay'
              type="checkbox"
              style={{width: "1.5em", marginLeft: "9px", marginRight: "9px"}}
              checked={allDay}
              disabled={closed}
              onChange={() =>  {
                const newAllDay = !allDay;
                setAllDay(newAllDay);

                if (!newAllDay){
                  const newYear = moment(possibleStartDatetime*1000).year();
                  const newMonth = moment(possibleStartDatetime*1000).month();
                  const newDay = moment(possibleStartDatetime*1000).date();
                  const newEndDatetime = moment(possibleEndDatetime*1000).year(newYear).month(newMonth).date(newDay);
                  setPossibleEndDatetime(newEndDatetime.unix());
              /*    if ( !addNewTask ) {
                    updateSimpleAttribute(taskId, {allDay: newAllDay, endDatetime: newEndDatetime.unix()});
                  }*/
                } else if ( !addNewTask ) {
            //      updateSimpleAttribute(taskId, {allDay: newAllDay});
                }

              }}
              />
            <span style={{marginLeft: "10px"}}>
              All day event
            </span>
          </section>
          <section>
          <ButtonRow>
          <LinkButton
            style={{marginRight: "auto", marginLeft: "0px"}}
            disabled={closed}
            onClick={(e) => {
              e.preventDefault();
              setOpenDatetime(false);
            }}
            >
            Close
          </LinkButton>
          <FullButton
            disabled={closed}
            onClick={(e) => {
              e.preventDefault();
              setStartDatetime(possibleStartDatetime);
              setEndDatetime(possibleEndDatetime);
              if ( !addNewTask ) {
                updateSimpleAttribute(taskId, {allDay: allDay, startDatetime: possibleStartDatetime, endDatetime: possibleEndDatetime});
              }
              setOpenDatetime(false);
            }}
            >
            Save
          </FullButton>
        </ButtonRow>
      </section>
        </DatetimePicker>
      </div>
        }


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
          disabled={closed}
          onChange={(e) => {
            setHours(e.target.value);
            if ( !addNewTask ) {
              updateSimpleAttribute(taskId, {hours: e.target.value});
            }
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
          disabled={closed}
          onChange={(e) => {
            setDescription(e.target.value);
            if ( !addNewTask ) {
              updateSimpleAttribute(taskId, {description: e.target.value});
            }
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
                  disabled={closed}
                  onClick={(e) => {
                    e.preventDefault();
                    if ( !addNewTask ) {
                      updateSimpleAttribute(taskId, {files: files.filter(f => f.dateCreated !== file.dateCreated)});
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
                  updateSimpleAttribute(taskId, {files: [...files, newFile]});
                } else {
                  setFiles([...files, newFile]);
                }
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
                  disabled={closed}
                  checked={subtask.closed}
                  onChange={() =>  editSubtask(subtask._id, subtask.name, !subtask.closed, subtask.task, subtask.dateCreated)}
                  />
                <HiddenInput
                  id={`subtask_name ${subtask._id}`}
                  type="text"
                  disabled={closed}
                  value={subtask.name}
                  onChange={(e) => editSubtask(subtask._id, e.target.value, subtask.closed, subtask.task, subtask.dateCreated)}
                  />

                <LinkButton
                disabled={closed}
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
              <LinkButton
              disabled={closed}
                 onClick={(e) => {e.preventDefault(); setOpenNewSubtask(true);}}
                 >
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
                disabled={closed}
                value={newSubtaskName}
                onChange={(e) => setNewSubtaskName(e.target.value)}
                />
              <LinkButton
                disabled={closed}
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
                disabled={closed}
                onClick={(e) => {
                  e.preventDefault();
                  if (!addNewTask){
                    addNewSubtask( newSubtaskName, false, taskId, moment().unix() );
                  } else{
                    setAddedSubtasks([...addedSubtasks, {change: ADDED, name: newSubtaskName, closed: false, dateCreated: moment().unix()}]);
                  }
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

      {
        !addNewTask &&
        <section className="comments">
          <HiddenTextarea
            type="text"
            disabled={closed}
            id="comments"
            name="comments"
            placeholder="Write a comment"
            value={newCommentBody}
            onChange={(e) => setNewCommentBody(e.target.value)}
            />
          <ButtonRow>
            {newCommentBody.length > 0 &&
              <LinkButton
                colour="grey"
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
                    disabled={closed}
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
                    disabled={closed}
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
                    disabled={closed}
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
                      <LinkButton
                        colour="grey"
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
      }
      {
        addNewTask &&
        <ButtonCol>
          <FullButton colour="grey" onClick={(e) => {e.preventDefault(); onCancel();}}>{translations[language].cancel}</FullButton>
          <FullButton
            colour=""
            disabled={name.length === 0 || !folder}
            onClick={(e) => {
              e.preventDefault();
              addNewTask(
                name,
                important,
                assigned.map(user => user._id),
                startDatetime,
                endDatetime,
                hours,
                description,
                subtasks,
                comments,
                files,
                folder._id,
                e._id,
                moment().unix()
              );
            }}
            >
            {translations[language].save}
          </FullButton>
        </ButtonCol>
      }
    </Form>
  );
};
