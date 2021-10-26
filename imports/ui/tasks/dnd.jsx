import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useSelector,
  useDispatch
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
  addNewHistory
} from './historyHandlers';

import {
  closeTask,
  removeTask,
  restoreLatestTask,
  updateSimpleAttribute
} from './tasksHandlers';

import AddTask from './addContainer';
import EditTask from './editContainer';
import FilterSummary from '/imports/ui/filters/summary';

import {
  setChosenTask
} from '/imports/redux/metadataSlice';

import {
  LeftArrowIcon,
  RestoreIcon,
  PlusIcon,
  CloseIcon,
  UserIcon,
  MoveIcon,
  SendIcon,
  FullStarIcon,
  EmptyStarIcon,
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

const getItemStyle = (isDragging, draggableStyle) => ({
  ...draggableStyle,
});

const getListStyle = isDraggingOver => ({
  display: 'flex',
});

export default function DND( props ) {

  const dispatch = useDispatch();

  const {
  match,
  history,
  folder,
  sortedTasks,
  removedTasks,
  subtasks,
  comments,
} = props;

const {
  folderID
} = match.params;

const {
  search,
  filter,
  sortBy,
  sortDirection,
  chosenTask,
} = useSelector( ( state ) => state.metadata.value );

const [ isDropDisabled, setIsDropDisabled ] = useState(false);

const [ showClosed, setShowClosed ] = useState( [] );
const [ newContainerName, setNewContainerName ] = useState( "" );
const [ openNewTask, setOpenNewTask ] = useState( [] );

const userId = Meteor.userId();
const user = useTracker( () => Meteor.user() );
const language = useMemo( () => {
  return user.profile.language;
}, [ user ] );

const containers = useMemo( () => {
  if ( folder.containers && folder.containers.length > 0) {
    return [{_id: 0, label: "New", order: 0}, ...folder.containers.map((container, index) => ({...container, order: container.order ? container.order: index + 1 })).sort((c1, c2) => c1.order < c2.order ? -1 : 1)];
  }
  return [{_id: 0, label: "New", order: 0}];
}, [ folder ] );

const addQuickTask = (containerId) => {
  const dateCreated = moment().unix();
  addTask(
    openNewTask.find(t => t.container === containerId).name,
    [userId],
    folderID,
    dateCreated,
    containerId,
    (_id) => {
      addNewHistory(
        _id,
        [ {
            dateCreated,
            user: userId,
            message: "created this task!",
        } ]
      );
      setOpenNewTask([...openNewTask.filter(open => open.container !== containerId)]);
    },
    () => console.log( error )
  );
}

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

  const activeAndClosedTasks = useMemo( () => {
    let result = {};
    containers.forEach((container, i) => {
        let newEntry = {};
        newEntry.active = tasksByContainer[container._id] ? tasksByContainer[container._id].filter( task => !task.closed) : [];
        newEntry.closed = tasksByContainer[container._id] ? tasksByContainer[container._id].filter( task => task.closed) : [];
        result[container._id] = {...newEntry};
    });
    return result;
  }, [ tasksByContainer, showClosed, containers ] );

  const handleOnDragEnd = (result) => {

    const { source, destination } = result;
    if (!destination) return;

    if (source.droppableId === "container-area"){

      if (destination.droppableId !== "container-area") return;
      let newContainers = [...folder.containers];
      const [removed] = newContainers.splice(source.index-1, 1);
      newContainers.splice(destination.index-1, 0, removed);
      newContainers = newContainers.map((container, index) => ({...container, order: index + 1}));
      editContianers(newContainers, folder._id);

    } else if (destination.droppableId === source.droppableId){

      let newTasks = [ ...activeAndClosedTasks[parseInt(destination.droppableId)].active, ...activeAndClosedTasks[parseInt(destination.droppableId)].closed ];
      const [removed] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, removed);

      newTasks.forEach((task, i) => {
        updateSimpleAttribute(task._id, {order: i});
      });

    } else {

      let newSourceTasks = [ ...activeAndClosedTasks[parseInt(source.droppableId)].active, ...activeAndClosedTasks[parseInt(source.droppableId)].closed ];
      let newDestinationTasks = [ ...activeAndClosedTasks[parseInt(destination.droppableId)].active, ...activeAndClosedTasks[parseInt(destination.droppableId)].closed ];

      const [removed] = newSourceTasks.splice(source.index, 1);

      newDestinationTasks.splice(destination.index, 0, removed);

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

      <FilterSummary
        {...props}
        style={{padding: "0px"}}
        />

    <div style={{display: "flex"}}>

      <DragDropContext
        onDragStart={(draggedObject) => {
          if (draggedObject.source.droppableId === "container-area"){
            setIsDropDisabled(false);
          } else {
            setIsDropDisabled(true);
          }
        }}
        onDragEnd={handleOnDragEnd}
        >
        <Droppable
          droppableId={"container-area"}
          direction="horizontal"
          isDropDisabled={isDropDisabled}
          >
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              style={getListStyle(snapshot.isDraggingOver)}
              ref={provided.innerRef}
              >
              {
                containers.map((container, index) => (
                  <Draggable
                    key={container._id}
                    draggableId={container._id + ""}
                    index={index}
                    isDragDisabled={container._id === 0}
                    >
                    {(provided, snapshot) => (
                      <ul
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={getItemStyle(
                          snapshot.isDragging,
                          provided.draggableProps.style
                        )}
                        >
                        <div style={{display: "flex", alignItems: "baseline"}}>
                        <HiddenInput
                          style={{fontSize: "2em", padding: "0px", height: "fit-content", fontWeight: "200", marginBottom: "0.6em", width: container._id !== 0 ? "300px" : "400px"}}
                          className="thin-placeholder truly-invisible"
                          id={`header-${container.label}-${container._id}`}
                          placeholder="Add new container"
                          disabled={container._id === 0}
                          type="text"
                          value={container.label}
                          onChange={(e) => {}}
                          />
                          {
                            container._id !== 0 &&
                            <img
                              className="icon"
                              style={{  marginLeft: "auto", cursor: "grab", width: "1.5em",  height: "1.5em", marginRight: "0px" }}
                              src={MoveIcon}
                              alt="MoveIcon icon not found"
                              />
                        }
                      </div>

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
                                  addQuickTask(container._id);
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

                        <Droppable
                          droppableId={container._id + ""}
                          >
                          {(provided) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              style={activeAndClosedTasks[container._id]["active"].length === 0 ? {width: "100%", minHeight: "500px"} : {}}
                              >
                              {
                                activeAndClosedTasks[container._id]["active"].map((task, index) => (
                                  <Draggable
                                    key={task._id}
                                    draggableId={task._id}
                                    index={index}
                                    >
                                    {(provided) => (
                                      <ItemCard
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                         onClick={() => dispatch(setChosenTask(task._id))}
                                        >
                                        <div className="info-bar">
                                          <Input
                                            id={`task_name ${task._id}`}
                                            type="checkbox"
                                            checked={task.closed}
                                            onClickCapture={(e) => {
                                              closeTask(task);
                                              e.stopPropagation();
                                            }}
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
                                            onClickCapture={(e) => {
                                              e.preventDefault();
                                              removeTask(task, removedTasks, subtasks, comments);
                                              e.stopPropagation();
                                            }}
                                            >
                                            <img
                                              className="icon"
                                              src={CloseIcon}
                                              alt="Close icon not found"
                                              />
                                          </LinkButton>
                                        </div>
                                        <div>
                                          <span htmlFor={`task_name ${task._id}`}>
                                            {task.name}
                                          </span>
                                        </div>
                                      </ItemCard>
                                    )}
                                  </Draggable>
                                ))
                              }

                              <hr
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{marginBottom: "1em"}}
                                />
                                <div
                                  style={{display: "flex", alignItems: "center", marginBottom: "1em"}}
                                  >
                                  <Switch
                                    id="show-closed"
                                    name="show-closed"
                                    onChange={() => {
                                      let newShowClosed = [...showClosed];
                                      if (newShowClosed.includes(container._id)){
                                        newShowClosed = newShowClosed.filter(item => item !== container._id);
                                      } else {
                                        newShowClosed.push(container._id);
                                      }
                                      setShowClosed(newShowClosed);
                                    }}
                                    checked={showClosed.includes(container._id)}
                                    onColor="#0078d4"
                                    uncheckedIcon={false}
                                    checkedIcon={false}
                                    style={{
                                      marginRight: "0.2em",
                                      display: "none"
                                    }}
                                    />
                                  <span htmlFor="show-closed"  style={{marginLeft: "0.6em"}}>
                                    {translations[language].showClosed}
                                  </span>
                                </div>

                                {
                                  showClosed.includes(container._id) &&
                                  activeAndClosedTasks[container._id]["closed"].map((task, index) => (
                                    <Draggable
                                      key={task._id}
                                      draggableId={task._id}
                                       index={activeAndClosedTasks[container._id]["active"].length + index}
                                       >
                                      {(provided) => (
                                    <ItemCard
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      onClick={() => dispatch(setChosenTask(task._id))}
                                      >
                                      <div className="info-bar">
                                        <Input
                                          id={`task_name ${task._id}`}
                                          type="checkbox"
                                          checked={task.closed}
                                          onClickCapture={(e) => {
                                            closeTask(task);
                                            e.stopPropagation();
                                          }}
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
                                          onClickCapture={(e) => {
                                            e.preventDefault();
                                            removeTask(task, removedTasks, subtasks, comments);
                                            e.stopPropagation();
                                          }}
                                          >
                                          <img
                                            className="icon"
                                            src={CloseIcon}
                                            alt="Close icon not found"
                                            />
                                        </LinkButton>
                                      </div>
                                      <div>
                                        <span htmlFor={`task_name ${task._id}`}>
                                          {task.name}
                                        </span>
                                      </div>
                                    </ItemCard>
                                  )}
                                  </Draggable>
                                  ))
                                }
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>

                      </ul>
                    )}
                  </Draggable>
                ))
              }
              {provided.placeholder}
            </div>
          )}
        </Droppable>
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
            onClick={(e) => {
              e.preventDefault();
              editContianers(folder.containers ? [...folder.containers, {_id: folder.containers.length + 1, label: newContainerName, order: folder.containers.length + 1}] : [{_id: 1, label: newContainerName, order: 1}], folder._id);
              setNewContainerName("");
            }}
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
          <EditTask {...props} taskId={chosenTask} close={() => dispatch(setChosenTask(null))}/>
        </ModalBody>
      </Modal>
      }

    </DndContainer>
  );
};
