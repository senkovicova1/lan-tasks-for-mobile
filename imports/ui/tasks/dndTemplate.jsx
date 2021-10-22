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


const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  padding: grid * 2,
  margin: `0 ${grid}px 0 0`,

  // change background colour if dragging
  background: isDragging ? 'lightgreen' : 'grey',

  // styles we need to apply on draggables
  ...draggableStyle,
});

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? 'lightblue' : 'lightgrey',
  display: 'flex',
  padding: grid,
  overflow: 'auto',
});

export default function DND( props ) {

  const {
  match,
  history,
  folder,
  sortedTasks,
  removedTasks,
  subtasks,
  comments,
  setParentChosenTask,
  chosenTask
} = props;
/*
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
  }*/

  const [ columns, setColumns ] = useState([{_id: 0, label: "col 0", order: 0}, {_id: 1, label: "col 1", order: 1}, {_id: 2, label: "col 2", order: 2}, {_id: 3, label: "col 3", order: 3} ]);
  const [ items, setItems ] = useState([[{_id: 4, label: "A", order: 0, col: 0}, {_id: 5, label: "B", order: 1, col: 0}, {_id: 6, label: "C", order: 2, col: 0}], [{_id: 7, label: "D", order: 0, col: 1}, {_id: 8, label: "E", order: 1, col: 1}, {_id: 9, label: "F", order: 2, col: 1}], [], []]);

  const [ isDropDisabled, setIsDropDisabled ] = useState(false);

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
        onDragEnd={(result) => {
          const { source, destination } = result;
          if (!destination) return;

          if (source.droppableId === "container-area"){

            if (destination.droppableId !== "container-area") return;

            const newCols = [...columns];
            const [removed] = newCols.splice(source.index, 1);
            newCols.splice(destination.index, 0, removed);
            setColumns(newCols);

          } else if (source.droppableId === destination.droppableId){

              const newSubItems = [...items[parseInt(source.droppableId[10])] ];
              const [removed] = newSubItems.splice(source.index, 1);
              newSubItems.splice(destination.index, 0, removed);
              const newCosl = items.map((group, index) => {
                if (index === parseInt(source.droppableId[10])){
                  return newSubItems;
                } else {
                  return group;
                }
              });
              setItems(newCosl);

          } else {

            let newSourceItems = [...items[parseInt(source.droppableId[10])] ];
            let newDestItems = [...items[parseInt(destination.droppableId[10])] ];
            const [removed] = newSourceItems.splice(source.index, 1);
            newSourceItems = newSourceItems.filter(item => item._id !== removed._id);
            newDestItems.splice(destination.index, 0, removed);
            const newCosl = items.map((group, index) => {
              if (index === parseInt(source.droppableId[10])){
                return newSourceItems;
              } else if (index === parseInt(destination.droppableId[10])){
                return newDestItems;
              } else {
                return group;
              }
            });
            setItems(newCosl);

          }
        }}
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
                columns.map((col, index) => (
                  <Draggable key={col._id} draggableId={col.label + col._id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        style={{width: "100px", backgroundColor: "white", border: "1ps solid red"}}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={getItemStyle(
                          snapshot.isDragging,
                          provided.draggableProps.style
                        )}
                        >
                        <p>{col.label}</p>

                        <Droppable
                          droppableId={"container-" + col._id}
                          >
                          {(provided) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              >
                              {
                                items[col._id].map((item, index) => (
                                  <Draggable
                                    key={item._id}
                                    draggableId={item.label + item._id} index={index}
                                    >
                                    {(provided) => (
                                      <p
                                        style={{width: "100px", backgroundColor: "white", border: "1ps solid red"}}
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        >
                                        {item.label}
                                      </p>
                                    )}
                                  </Draggable>
                                ))
                              }
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>

                      </div>
                    )}
                  </Draggable>
                ))
              }
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/*
        false &&
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
    */}
    </div>

    {/*
      chosenTask &&
      <Modal isOpen={true}>
        <ModalBody>
          <EditTask {...props} taskId={chosenTask} close={() => setParentChosenTask(null)}/>
        </ModalBody>
      </Modal>
  */  }

    </DndContainer>
  );
};

/*
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
              container._id !== 0 &&
               <LinkButton
              onClick={(e) => {
                e.preventDefault();
                //changeOrder(container, -1);
              }}
              >
              <img
                className="icon"
                style={{ width: "1.5em",  height: "1.5em", marginRight: "0px" }}
                src={MoveIcon}
                alt="MoveIcon icon not found"
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
*/
