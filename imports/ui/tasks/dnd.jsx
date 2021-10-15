import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useDispatch,
  useSelector
} from 'react-redux';

import {
  useTracker
} from 'meteor/react-meteor-data';

import moment from 'moment';

import Select from 'react-select';

import Switch from "react-switch";

import { Calendar, momentLocalizer } from 'react-big-calendar';

import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import {
  Modal,
  ModalBody
} from 'reactstrap';

import {
  removeSubtask
} from './subtasksHandlers';

import {
  removeComment
} from './commentsHandlers';

import {
  editContianers
} from './containersHandlers';

import {
  addTask,
  closeTask,
  removeTask,
  restoreLatestTask,
  updateSimpleAttribute
} from './tasksHandlers';

import AddTask from './addContainer';
import EditTask from './editContainer';

import {
  setFilter
} from '/imports/redux/metadataSlice';

import {
  RestoreIcon,
  PlusIcon,
  CloseIcon,
  SettingsIcon,
  UserIcon,
  SendIcon,
  FullStarIcon,
  EmptyStarIcon,
  ClockIcon,
  CalendarIcon,
  FolderIcon,
  AsteriskIcon
} from "/imports/other/styles/icons";

import {
  selectStyle
} from '/imports/other/styles/selectStyles';

import {
  AppliedFilter,
  DndContainer,
  LinkButton,
  ItemCard,
  HiddenInput,
  Input,
  ItemContainer,
  InlineInput
} from "/imports/other/styles/styledComponents";

import {
  PLAIN,
  COLUMNS
} from "/imports/other/constants";

import {
  translations
} from '/imports/other/translations';

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

export default function DND( props ) {

  const dispatch = useDispatch();

  const {
  match,
  history,
  folder,
  setParentChosenTask,
  chosenTask
} = props;

const {
  folderID
} = match.params;

const {
  search,
  filter,
  sortBy,
  sortDirection,
} = useSelector( ( state ) => state.metadata.value );

const [ showClosed, setShowClosed ] = useState( false );
const [ newContainerName, setNewContainerName ] = useState( "" );
const [ openNewTask, setOpenNewTask ] = useState( [] );

const userId = Meteor.userId();
const user = useTracker( () => Meteor.user() );
const language = useMemo( () => {
  return user.profile.language;
}, [ user ] );

const dbUsers = useSelector( ( state ) => state.users.value );
const tasks = useSelector( ( state ) => state.tasks.value );
const subtasks = useSelector( ( state ) => state.subtasks.value );
const comments = useSelector( ( state ) => state.comments.value );

const containers = useMemo( () => {
  if ( folder.containers && folder.containers.length > 0) {
    return [{_id: 0, label: "New"}, ...folder.containers];
  }
  return [{_id: 0, label: "New"}];
}, [ folder ] );

const removedTasks = useMemo( () => {
  if ( folder._id ) {
    return tasks.filter( t => t.folder._id === folder._id && t.removedDate ).sort( ( t1, t2 ) => ( t1.removedDate < t2.removedDate ? 1 : -1 ) );
  }
  return tasks.filter( t => t.removedDate ).sort( ( t1, t2 ) => ( t1.removedDate < t2.removedDate ? 1 : -1 ) );
}, [ tasks, folder._id ] );

const addQuickTask = (containerId) => {
  addTask(
    openNewTask.find(t => t.container === containerId).name,
    [userId],
    folderID,
    moment().unix(),
    containerId,
    () => {
      setOpenNewTask([...openNewTask.filter(open => open.container !== containerId)]);
    },
    () => console.log( error )
  );
}

const filteredTasks = useMemo( () => {
  return tasks.filter( task => !task.removedDate &&
    ( task.folder._id === folder.value ||
      (folder.value === "important" && task.important) ||
      (
         "all" === folder.value &&
        task.assigned.some(assigned => assigned._id === userId)
       )
    )
  );
}, [ tasks, folder, userId ] );

const searchedTasks = useMemo( () => {
  return filteredTasks.filter( task => task.name.toLowerCase().includes( search.toLowerCase() ) );
}, [ search, filteredTasks ] );

const tasksWithAdvancedFilters = useMemo( () => {
  const folderIds = filter.folders.map(folder => folder._id);
  const filteredByFolders = searchedTasks.filter( task => filter.folders.length === 0 || folderIds.includes(task.folder._id));
  const filteredByImportant = filteredByFolders.filter(task => !filter.important || task.important);
  const assignedIds = filter.assigned.map(user => user._id);
  const filteredByAssigned = filteredByImportant.filter(task => filter.assigned.length === 0 || task.assigned.some(assigned => assignedIds.includes(assigned._id)));
  const filteredByDatetimes = (filter.deadlineMin || filter.deadlineMax) ? filteredByAssigned.filter(task => {
    const actualDatetimeMin = filter.datetimeMin ? filter.datetimeMin : 0;
    const actualDatetimeMax = filter.datetimeMax ? filter.datetimeMax : 8640000000000000;
    if (!task.startDatetime && !task.endDatetime){
      return false;
    }
    if (task.startDatetime && !task.endDatetime){
      return task.startDatetime <= actualDatetimeMax;
    }
    if (!task.startDatetime && task.endDatetime){
      return actualDatetimeMin <= task.endDatetime;
    }
    return (task.startDatetime <= actualDatetimeMax) && (actualDatetimeMin <= task.endDatetime);
  } ) : filteredByAssigned;
  const filteredByDateCreated = filteredByDatetimes.filter(task => (!filter.dateCreatedMin || filter.dateCreatedMin <= task.dateCreated) && (!filter.dateCreatedMax || task.dateCreated <= filter.dateCreatedMax));
  return filteredByDateCreated;
}, [ filter, searchedTasks ] );

const sortedTasks = useMemo( () => {
  const multiplier = !sortDirection || sortDirection === "asc" ? -1 : 1;
  return tasksWithAdvancedFilters
    .sort( ( t1, t2 ) => {
      if ( sortBy === "assigned" ) {
        return t1.assigned.map(assigned => assigned.label).join(" ").toLowerCase() < t2.assigned.map(assigned => assigned.label).join(" ").toLowerCase() ? 1 * multiplier : ( -1 ) * multiplier;
      }
      if ( sortBy === "date" ) {
        return t1.dateCreated < t2.dateCreated ? 1 * multiplier : ( -1 ) * multiplier;
      }
      if ( sortBy === "important" ) {
        return t1.important ? 1 * multiplier : ( -1 ) * multiplier;
      }
      if ( sortBy === "customOrder" ) {
        if (!t1.order && !t2.order){
          return 0;
        }
        if (t1.order && !t2.order){
          return ( -1 ) * multiplier;
        }
        if (!t1.order && t2.order){
          return 1 * multiplier;
        }
        return t1.order < t2.order ?  1 * multiplier : ( -1 ) * multiplier;
      }
      return t1.name.toLowerCase() < t2.name.toLowerCase() ? 1 * multiplier : ( -1 ) * multiplier;
    } );
}, [ tasksWithAdvancedFilters, sortBy, sortDirection ] );

  const groupBy = (arr, key) => {
    const initialValue = {};
    return arr.reduce((acc, cval) => {
      const myAttribute = cval[key];
      acc[myAttribute] = [...(acc[myAttribute] || []), cval]
      return acc;
    }, initialValue);
  };

  const tasksByContainer = useMemo( () => {
    return groupBy(sortedTasks, 'container')
  }, [ sortedTasks ] );

  const activeTasks = useMemo( () => {
    let result = {};
    containers.forEach((container, i) => {
        result[container._id] = tasksByContainer[container._id] ? tasksByContainer[container._id].filter( task => !task.closed) : [];
    });
    return result;
  }, [ tasksByContainer, showClosed, containers ] );

  const numberOfFilters = useMemo(() => {
    return ((filter.folders.length > 0) ? 1 : 0) +
              (filter.important ? 1 : 0) +
              (filter.assigned.length > 0 ? 1 : 0) +
              (filter.deadlineMin ? 1 : 0) +
              (filter.deadlineMax ? 1 : 0) +
              (filter.dateCreatedMin ? 1 : 0) +
              (filter.dateCreatedMax ? 1 : 0);
  }, [filter]);

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;
    const { draggableId, destination, source } = result;
    if (destination.droppableId === source.droppableId){
      let newTasks = activeTasks[parseInt(destination.droppableId)];
      const movedTask = newTasks[source.index];
      newTasks = newTasks.filter((_, index) => index !== source.index);
      newTasks.splice(destination.index, 0, movedTask);
      newTasks.forEach((task, i) => {
        updateSimpleAttribute(task._id, {order: i});
      });
    } else {
      let newSourceTasks = activeTasks[parseInt(source.droppableId)];
      let newDestinationTasks = activeTasks[parseInt(destination.droppableId)];
      const movedTask = newSourceTasks[source.index];
      newSourceTasks = newSourceTasks.filter((_, index) => index !== source.index);
      newDestinationTasks.splice(destination.index, 0, movedTask);
      newSourceTasks.forEach((task, i) => {
        updateSimpleAttribute(task._id, {order: i});
      });
      newDestinationTasks.forEach((task, i) => {
        updateSimpleAttribute(task._id, {container: parseInt(destination.droppableId), order: i});
      });
    }
  }

  return (
    <DndContainer>
      {
        numberOfFilters > 0 &&
      <AppliedFilter style={{padding: "0px"}}>
        {
          filter.folders.length > 0 &&
          <section className="filter">
            <div className="filter-container">
            <img
              className="label-icon"
              src={FolderIcon}
              alt="FolderIcon icon not found"
              />
            <label>{filter.folders.map(folder => folder.name).join(", ")}</label>
              <LinkButton
                onClick={(e) => {
                  e.preventDefault();
                  dispatch(setFilter({...filter, folders: []}));
                }}
                >
                <img
                  className="icon"
                  src={CloseIcon}
                  alt="Close icon not found"
                  />
              </LinkButton>
          </div>
          </section>
        }
        {
          filter.important &&
          <section className="filter">
            <div className="filter-container">
            <img
              className="label-icon"
              src={EmptyStarIcon}
              alt="EmptyStarIcon icon not found"
              />
            <label>Important</label>
              <LinkButton
                onClick={(e) => {
                  e.preventDefault();
                  dispatch(setFilter({...filter, important: false}));
                }}
                >
                <img
                  className="icon"
                  src={CloseIcon}
                  alt="Close icon not found"
                  />
              </LinkButton>
          </div>
          </section>
        }
        {
          filter.assigned.length > 0 &&
          <section className="filter">
            <div className="filter-container">
            <img
              className="label-icon"
              src={UserIcon}
              alt="UserIcon icon not found"
              />
            <label>{filter.assigned.map(user => user.label).join(", ")}</label>
              <LinkButton
                onClick={(e) => {
                  e.preventDefault();
                  dispatch(setFilter({...filter, assigned: []}));
                }}
                >
                <img
                  className="icon"
                  src={CloseIcon}
                  alt="Close icon not found"
                  />
              </LinkButton>
          </div>
          </section>
        }
        {
          (filter.deadlineMin || filter.deadlineMax)  &&
          <section className="filter">
            <div className="filter-container">
            <img
              className="label-icon"
              src={CalendarIcon}
              alt="CalendarIcon icon not found"
              />
            <label>{`${filter.deadlineMin ? moment.unix(filter.deadlineMin).format("D.M.YYYY HH:mm:ss") : "No start date"} - ${filter.deadlineMax ? moment.unix(filter.deadlineMax).format("D.M.YYYY HH:mm:ss") : "No end date"}`}</label>
              <LinkButton
                onClick={(e) => {
                  e.preventDefault();
                  dispatch(setFilter({...filter, deadlineMin: "", deadlineMax: ""}));
                }}
                >
                <img
                  className="icon"
                  src={CloseIcon}
                  alt="Close icon not found"
                  />
              </LinkButton>
          </div>
          </section>
        }
        {
          (filter.dateCreatedMin || filter.dateCreatedMax)  &&
          <section className="filter">
            <div className="filter-container">
            <img
              style={{width: "auto"}}
              className="label-icon"
              src={AsteriskIcon}
              alt="AsteriskIcon icon not found"
              />
            <label>{`${filter.dateCreatedMin ? moment.unix(filter.dateCreatedMin).format("D.M.YYYY HH:mm:ss") : "No start date"} - ${filter.dateCreatedMax ? moment.unix(filter.dateCreatedMax).format("D.M.YYYY HH:mm:ss") : "No end date"}`}</label>
              <LinkButton
                onClick={(e) => {
                  e.preventDefault();
                  dispatch(setFilter({...filter, dateCreatedMin: "", dateCreatedMax: ""}));
                }}
                >
                <img
                  className="icon"
                  src={CloseIcon}
                  alt="Close icon not found"
                  />
              </LinkButton>
          </div>
          </section>
        }

        {
          numberOfFilters >= 2 &&
          <LinkButton
            onClick={(e) => {
              e.preventDefault();
              dispatch(setFilter({
                folders: [],
                important: false,
                deadlineMin: "",
                deadlineMax: "",
                assigned: [],
                dateCreatedMin: "",
                dateCreatedMax: "",
              }));
            }}
            >
            Remove all filters
          </LinkButton>
        }
      </AppliedFilter>
    }

    <div style={{display: "flex"}}>
      <DragDropContext
        onDragEnd={handleOnDragEnd}
        >
        {
          containers.map(container => (
            <Droppable droppableId={container._id + ""}>
              {(provided) => (
                <ul {...provided.droppableProps} ref={provided.innerRef}>
                  <HiddenInput
                    style={{fontSize: "2em", padding: "0px", height: "fit-content", fontWeight: "200", marginBottom: "0.6em"}}
                    className="thin-placeholder truly-invisible"
                    id={`header-${container.label}-${container._id}`}
                    placeholder="Add new container"
                    disabled={container._id === 0}
                    type="text"
                    value={container.label}
                    onChange={(e) => {
                      if (container._id != 0){
                        editContianers(folder.containers.map(c => {
                        if (c._id !== container._id){
                          return c;
                        }
                        return ({
                          _id: c._id,
                          label: e.target.value,
                        })
                      }), folder._id);
                    }
                  }}
                    />
                  <ItemCard>
                    {
                      folder._id &&
                      !openNewTask.find(t => t.container === container._id) &&
                      <InlineInput  style={{padding: "0px"}}>
                        <LinkButton style={{marginLeft: "0px"}} onClick={(e) => {e.preventDefault(); setOpenNewTask([...openNewTask, {container: container._id, name: ""} ]);}}>
                          <img
                            className="icon"
                            style={{marginLeft: "2px", marginRight: "0.8em"}}
                            src={PlusIcon}
                            alt="Plus icon not found"
                            />
                          Task
                        </LinkButton>
                      </InlineInput>
                    }

                    {
                      folder._id &&
                      openNewTask.find(t => t.container === container._id) &&
                      <InlineInput style={{padding: "0px", display: "flex"}}>
                        <input
                          id={`add-task`}
                          type="text"
                          placeholder="New task"
                          value={openNewTask.find(t => t.container === container._id).name}
                          onChange={(e) => setOpenNewTask([...openNewTask.map(open =>{
                            if (open.container !== container._id){
                              return open;
                            }
                            return {...open, name: e.target.value};
                          })])}
                          />
                        <LinkButton
                          onClick={(e) => {e.preventDefault(); setOpenNewTask([...openNewTask.filter(open => open.container !== container._id)]);}}
                          className="connected-btn"
                          >
                          <img
                            className="icon"
                            src={CloseIcon}
                            alt="Close icon not found"
                            />
                        </LinkButton>

                        {
                          openNewTask.find(t => t.container === container._id).name.length > 0 &&
                          <LinkButton
                            onClick={(e) => {
                              e.preventDefault();
                              addQuickTask(container._id === 0 ? undefined : container._id);
                            }}
                            className="connected-btn"
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
                  </ItemCard>

                  {
                    activeTasks[container._id].map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided) => (
                      <ItemCard ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                        <div className="info-bar">
                          <Input
                            id={`task_name ${task._id}`}
                            type="checkbox"
                            checked={task.closed}
                            onChange={() => closeTask(task)}
                            />
                          {
                            task.important &&
                            <img
                              className="icon star"
                              src={FullStarIcon}
                              alt="Full star icon not found"
                              />
                          }
                          {
                            !task.important &&
                            <img
                              className="icon star"
                              src={EmptyStarIcon}
                              alt="Empty star icon not found"
                              />
                          }
                          {
                            task.assigned.map(assigned => (
                              <img key={assigned._id} className="avatar" src={assigned.img} alt="" title={assigned.label}/>
                            ))
                          }
                          <LinkButton
                            onClick={(e) => {e.preventDefault(); removeTask(task, removedTasks, subtasks, comments)}}
                            >
                            <img
                              className="icon"
                              src={CloseIcon}
                              alt="Close icon not found"
                              />
                          </LinkButton>
                        </div>
                        <div>
                          <span htmlFor={`task_name ${task._id}`} onClick={() => setParentChosenTask(task._id)}>
                            {task.name}
                          </span>
                        </div>
                      </ItemCard>
                    )}
                    </Draggable>
                    ))
                  }
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          ))
        }
      </DragDropContext>
      {
        folder._id &&
      <div className="new-container-form">
        <HiddenInput
          style={{fontSize: "2em", padding: "0px", height: "fit-content", fontWeight: "200"}}
          className="thin-placeholder"
          id={"newContainer"}
          placeholder="Add new container"
          type="text"
          value={newContainerName}
          onChange={(e) => setNewContainerName(e.target.value)}
          />
        {
          newContainerName &&
          <LinkButton
            onClick={(e) => {e.preventDefault(); editContianers(folder.containers ? [...folder.containers, {_id: folder.containers.length + 1, label: newContainerName}] : [{_id: 1, label: newContainerName}], folder._id); setNewContainerName("")}}
            >
            <img
              className="icon"
              src={PlusIcon}
              alt="PlusIcon icon not found"
              />
          </LinkButton>
        }
      </div>
    }
    </div>

    {
      chosenTask &&
      <Modal isOpen={true}>
        <ModalBody>
          <EditTask {...props} taskId={chosenTask} close={() => setParentChosenTask(null)}/>
        </ModalBody>
      </Modal>
    }

    </DndContainer>
  );
};

/*

      {
        activeTasks.length > 0 &&
        activeTasks.map(task => (
          <ItemCard>
            <div className="info-bar">
              <Input
                id={`task_name ${task._id}`}
                type="checkbox"
                checked={task.closed}
                onChange={() => closeTask(task)}
                />
              {
                task.important &&
                <img
                  className="icon star"
                  src={FullStarIcon}
                  alt="Full star icon not found"
                  />
              }
              {
                !task.important &&
                <img
                  className="icon star"
                  src={EmptyStarIcon}
                  alt="Empty star icon not found"
                  />
              }
              {
                task.assigned.map(assigned => (
                  <img key={assigned._id} className="avatar" src={assigned.img} alt="" title={assigned.label}/>
                ))
              }
              <LinkButton
                onClick={(e) => {e.preventDefault(); removeTask(task, removedTasks, subtasks, comments)}}
                >
                <img
                  className="icon"
                  src={CloseIcon}
                  alt="Close icon not found"
                  />
              </LinkButton>
            </div>
            <div>
              <span htmlFor={`task_name ${task._id}`} onClick={() => setParentChosenTask(task._id)}>
                {task.name}
              </span>
            </div>
          </ItemCard>
        ))
      }
      <hr style={{marginTop: "7px", marginBottom: "7px"}}/>

      <ItemContainer key="commands" style={{padding: "0px"}} >
        <Switch
          id="show-closed"
          name="show-closed"
          onChange={() => setShowClosed(!showClosed)}
          checked={showClosed}
          onColor="#0078d4"
          uncheckedIcon={false}
          checkedIcon={false}
          style={{
            marginRight: "0.2em",
            display: "none"
          }}
          />
        <span htmlFor="show-closed">
          {translations[language].showClosed}
        </span>
        {
          removedTasks.length > 0 &&
          <LinkButton
            style={{marginLeft: "auto"}}
            onClick={(e) => {e.preventDefault(); restoreLatestTask(removedTasks)}}
            >
            <img
              className="icon"
              src={RestoreIcon}
              alt="Back icon not found"
              />
            <span>
              {translations[language].restoreTask}
            </span>
          </LinkButton>
        }

      </ItemContainer>

      {
        showClosed &&
        [].length === 0 &&
        <span className="message">You have no closed tasks.</span>
      }
      {
        showClosed &&
        [].length > 0 &&
        [].map(task => (
          <ItemCard>
            <div className="info-bar">
              <Input
                id={`task_name ${task._id}`}
                type="checkbox"
                checked={task.closed}
                onChange={() => closeTask(task)}
                />
              {
                task.important &&
                <img
                  className="icon star"
                  src={FullStarIcon}
                  alt="Full star icon not found"
                  />
              }
              {
                !task.important &&
                <img
                  className="icon star"
                  src={EmptyStarIcon}
                  alt="Empty star icon not found"
                  />
              }
              {
                task.assigned.map(assigned => (
                  <img key={assigned._id} className="avatar" src={assigned.img} alt="" title={assigned.label}/>
                ))
              }
              <LinkButton
                onClick={(e) => {e.preventDefault(); removeTask(task, removedTasks, subtasks, comments)}}
                >
                <img
                  className="icon"
                  src={CloseIcon}
                  alt="Close icon not found"
                  />
              </LinkButton>
            </div>
            <div>
              <span htmlFor={`task_name ${task._id}`} onClick={() => setParentChosenTask(task._id)}>
                {task.name}
              </span>
            </div>
          </ItemCard>
        ))
      }
      </div>
*/
