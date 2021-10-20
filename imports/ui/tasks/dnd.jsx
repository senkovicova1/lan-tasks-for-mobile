import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
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
import FilterSummary from '/imports/ui/filters/summary';


import {
  LeftArrowIcon,
  RestoreIcon,
  PlusIcon,
  CloseIcon,
  UserIcon,
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

export default function DND( props ) {

  const {
  match,
  history,
  folder,
  sortedTasks,
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
    if (!result.destination) return;
    const { draggableId, destination, source } = result;
    if (destination.droppableId === source.droppableId){

      let newTasks = [ ...activeAndClosedTasks[parseInt(destination.droppableId)].active, ...activeAndClosedTasks[parseInt(destination.droppableId)].closed ];
      const movedTask = newTasks[source.index];
      newTasks = newTasks.filter((_, index) => index !== source.index);
      newTasks.splice(destination.index, 0, movedTask);
      newTasks.forEach((task, i) => {
        updateSimpleAttribute(task._id, {order: i});
      });

    } else {
      let newSourceTasks = [ ...activeAndClosedTasks[parseInt(source.droppableId)].active, ...activeAndClosedTasks[parseInt(source.droppableId)].closed ];
      let newDestinationTasks = [ ...activeAndClosedTasks[parseInt(destination.droppableId)].active, ...activeAndClosedTasks[parseInt(destination.droppableId)].closed ];
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

  const changeOrder = (movedContainer, difference) => {
    let newContainers = [...folder.containers.map((container, index) => ({...container, order: container.order ? container.order: index + 1 })).sort((c1, c2) => c1.order < c2.order ? -1 : 1)];
    const containerToBeSwitched = newContainers[movedContainer.order + difference - 1];
    newContainers.splice(movedContainer.order + difference - 1, 1, movedContainer);
    newContainers.splice(movedContainer.order - 1, 1, containerToBeSwitched);
    newContainers = newContainers.map((container, index) => ({...container, order: index + 1}));
    editContianers(newContainers, folder._id);
  }

  return (
    <DndContainer>

      <FilterSummary
        {...props}
        style={{padding: "0px"}}
        />

    <div style={{display: "flex"}}>
      <DragDropContext
        onDragEnd={handleOnDragEnd}
        >
        {
          containers.map(container => (
            <Droppable droppableId={container._id + "-active"}>
              {(provided) => (
                <ul {...provided.droppableProps} ref={provided.innerRef}>
                  <div style={{display: "flex"}}>
                  <HiddenInput
                    style={{fontSize: "2em", padding: "0px", height: "fit-content", fontWeight: "200", marginBottom: "0.6em", width: container._id !== 0 ? "300px" : "400px"}}
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
                          order: c.order,
                        })
                      }), folder._id);
                    }
                  }}
                    />
                  {
                    container.order > 1 &&
                   <LinkButton
                  onClick={(e) => {
                    e.preventDefault();
                    changeOrder(container, -1);
                  }}
                  >
                  <img
                    className="icon"
                    src={LeftArrowIcon}
                    alt="LeftArrowIcon icon not found"
                    />
                </LinkButton>
              }
            {
              container.order !== 0 &&
              container.order !== (containers.length - 1) &&
               <LinkButton
              onClick={(e) => {
                e.preventDefault();
                changeOrder(container, 1);
              }}
              >
              <img
                style={{marginRight: "0px"}}
                className="icon flip"
                src={LeftArrowIcon}
                alt="LeftArrowIcon icon not found"
                />
            </LinkButton>
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

                  {
                    activeAndClosedTasks[container._id]["active"].map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided) => (
                      <ItemCard
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                         onClick={() => setParentChosenTask(task._id)}
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
                        <Draggable key={task._id} draggableId={task._id} index={activeAndClosedTasks[container._id]["active"].length + index}>
                          {(provided) => (
                        <ItemCard
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          onClick={() => setParentChosenTask(task._id)}
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
