import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
} from 'react';

import moment from 'moment';

import {
  Icon
} from '@fluentui/react/lib/Icon';

import {
  useTracker
} from 'meteor/react-meteor-data';
import {
  TasksCollection
} from '/imports/api/tasksCollection';
import {
  TagsCollection
} from '/imports/api/tagsCollection';
import {
  UsersCollection
} from '/imports/api/usersCollection';

import AddTaskContainer from './addTaskContainer';
import EditTaskContainer from './editTaskContainer';

import {
  WHOLE_TABLE,
  MY_TASKS,
  PLANNED,
  IMPORTANT,
  WITH_ACTIONS,
  WITH_MATERIALS,
  columns,
  statuses,
  ALL_COLUMNS,
  ACTIONS_COLUMNS,
  MATERIAL_COLUMNS
} from '../../other/constants';

import {
  List,
  SearchSection,
  Input
} from "../../other/styles/styledComponents";

export default function TaskList( props ) {

  const {
    match
  } = props;

  const findTag = match.params.tagID === 'all' ? null : match.params.tagID;
  const tasks = useTracker( () => TasksCollection.find( findTag ? {
      tag: findTag
    } : {} )
    .fetch() );
  const tags = useTracker( () => TagsCollection.find( {} )
    .fetch() );
  const users = useTracker( () => Meteor.users.find( {} )
    .fetch() );

  const userId = Meteor.userId();

  const showMy = useTracker( () => Meteor.user( {
      fields: {
        'profile.showMyTasks': 1
      }
    } )
    .profile.showMyTasks ) ;

  const [ showMyTasks, setShowMyTasks ] = useState( false );

  const [ search, setSearch ] = useState( "" );
  const [ searchStatus, setSearchStatus ] = useState( "" );
  const [ searchTitle, setSearchTitle ] = useState( "" );
  const [ searchDescription, setSearchDescription ] = useState( "" );
  const [ searchActions, setSearchActions ] = useState( "" );
  const [ searchDuration, setSearchDuration ] = useState( "" );
  const [ searchMaterial, setSearchMaterial ] = useState( "" );
  const [ searchAssigned, setSearchAssigned ] = useState( "" );
  const [ searchDeadline, setSearchDeadline ] = useState( "" );
  const [ chosenTask, setChosenTask ] = useState( null );

  const [ displayColumns, setDisplayColumns ] = useState( [] );
  const [ listType, setListType ] = useState( null );
  const [ showClosed, setShowClosed ] = useState(false);

  const handleShowMyTasksChange = useCallback(() => {
    let currentUser = users.find(user => user._id === userId);
    let data = {...currentUser.profile};
    data.showMyTasks = !showMyTasks;

    Meteor.users.update(userId, {
      $set: {
        profile: data
      }
    });
    setShowMyTasks(!showMyTasks);
  }, [showMyTasks, users]);

  useEffect( () => {
    setShowMyTasks( match.params.listType === MY_TASKS || showMy );
  }, [ showMy, match.params.listType] );

  useEffect( () => {
    const newListType = match.params.listType;
    if ( !newListType || newListType === WHOLE_TABLE ) {
      setDisplayColumns( ALL_COLUMNS );
      setListType( WHOLE_TABLE );
    }
    if ( !newListType || newListType === MY_TASKS ) {
      setDisplayColumns( ALL_COLUMNS );
      setListType( MY_TASKS );
    }
    if ( newListType === WITH_ACTIONS ) {
      setDisplayColumns( ACTIONS_COLUMNS );
      setListType( WITH_ACTIONS );
    }
    if ( newListType === WITH_MATERIALS ) {
      setDisplayColumns( MATERIAL_COLUMNS );
      setListType( WITH_MATERIALS );
    }
    if ( newListType === IMPORTANT ) {
      setDisplayColumns( ALL_COLUMNS );
      setListType( IMPORTANT );
    }
    if ( newListType === PLANNED ) {
      setDisplayColumns( ALL_COLUMNS );
      setListType( PLANNED );
    }
  }, [
    match.params.listType
  ] );

  const joinedTasks = useMemo( () =>
    tasks.map( task => ( {
      ...task,
      tag: tags.find( tag => tag._id === task.tag ),
      assigned: users.filter( user => task.assigned.includes( user._id ) ),
      status: statuses.find(s => s.value === task.status),
    } ) ), [ tasks, tags, users ] );

  const filteredByListTypeTasks = useMemo( () => {
    if ( !listType || listType === WHOLE_TABLE || listType === MY_TASKS ) {
      return joinedTasks;
    }
    if ( listType === IMPORTANT) {
      return joinedTasks.filter(task => task.important);
    }
    if ( listType === PLANNED) {
      return joinedTasks.sort((t1, t2) => (t1.deadline < t2.deadline) ? 1 : -1);
    }
    if ( listType === WITH_ACTIONS ) {
      return joinedTasks.filter( task => task.actions && task.actions.length > 0 );
    }
    if ( listType === WITH_MATERIALS ) {
      return joinedTasks.filter( task => task.materials && task.materials.length > 0 );
    }
  }, [ joinedTasks, listType ] );

  const filteredByOwnerTasks = useMemo(() => {
    if ( showMyTasks ) {
      return filteredByListTypeTasks.filter( task => task.assigned.some( a => a._id === userId ) );
    }
    return filteredByListTypeTasks;
  }, [filteredByListTypeTasks, showMyTasks]);

  const filteredTasks = useMemo( () => {
    return filteredByOwnerTasks.filter( task => task.title.toLowerCase().includes( searchTitle.toLowerCase() ) &&
    task.status.label.toLowerCase().includes( searchStatus.toLowerCase() ) &&
    task.description.toLowerCase().includes( searchDescription.toLowerCase() ) &&
    ( searchActions.length === 0 ||
      ( task.actions && task.actions.some( a => a.title.toLowerCase().includes( searchActions.toLowerCase() ) ) ) ) &&
    ( searchDuration.length === 0 ||
      ( task.actions && task.actions.some( a => ( a.duration + " hours" ).includes( searchDuration.toLowerCase() ) ) ) ) &&
    ( searchMaterial.length === 0 ||
      ( task.materials &&
        task.materials.some( m => ( m.title + m.amount + ( m.amount ? "pcs" : "" ) + m.price + ( m.price ? "eur" : "" ) ).toLowerCase().includes( searchMaterial.toLowerCase() ) ) ) ) &&
      ( searchAssigned.length === 0 ||
        task.assigned.some( a => ( a.profile.name + a.profile.surname ).toLowerCase().includes( searchAssigned.toLowerCase() ) ) ) &&
        moment.unix( task.deadline ).add( ( new Date ).getTimezoneOffset(), 'minutes' ).format( "DD.MM.yyyy hh:mm" ).includes( searchStatus.toLowerCase() )
      )
  }, [ filteredByOwnerTasks, searchTitle, searchStatus, searchDescription, searchActions, searchDuration, searchMaterial, searchAssigned, searchDeadline, showMyTasks ] );

  const filteredByStatusCheckboxes = useMemo(() => {
    return filteredTasks.filter(task => showClosed || !task.status.value);
  }, [filteredTasks, showClosed])

  const globalFilteredTasks = useMemo( () => {
    return filteredByStatusCheckboxes.filter( task => task.title.toLowerCase()
      .includes( search.toLowerCase() ) || task.status.label.toLowerCase()
      .includes( search.toLowerCase() ) || task.description.toLowerCase()
      .includes( search.toLowerCase() ) || ( task.actions && task.actions.some( a => ( a.title + a.duration + " hours" )
        .toLowerCase()
        .includes( search.toLowerCase() ) ) ) || ( task.materials && task.materials.some( m => ( m.title + m.amount + ( m.amount ? "pcs" : "" ) + m.price + ( m.price ? "eur" : "" ) )
        .toLowerCase()
        .includes( search.toLowerCase() ) ) ) || ( task.assigned.some( a => ( a.profile.name + a.profile.surname )
        .toLowerCase()
        .includes( search.toLowerCase() ) ) ) || moment.unix( task.deadline ).add( ( new Date ).getTimezoneOffset(), 'minutes' ).format( "DD.MM.yyyy hh:mm" ).includes( searchStatus.toLowerCase() )  )
  }, [ filteredByStatusCheckboxes, search ] )

  const colouredTasks = useMemo( () => {
      return globalFilteredTasks.map( ( task ) => {
        let newTask = {
          originalTask: {
            ...task,
            status: task.status.value,
          }
        };

        // TITLE
        if ( search.length > 0 && task.title.toLowerCase().includes( search.toLowerCase() ) ) {
          let startIndex = task.title.toLowerCase().indexOf( search.toLowerCase() );
          let endIndex = startIndex + search.length;
          newTask.title = <span> {task.important ? <Icon iconName="FavoriteStarFill" style={{color: "gold"}}/> : null } {task.title.substring( 0, startIndex - 1 )} <span style={{ backgroundColor: "yellow" }}> {task.title.substring( startIndex, endIndex )} </span> {task.title.substring(endIndex )} </span>;
        } else {
          newTask.title = <span>{task.important ? <Icon iconName="FavoriteStarFill"  style={{color: "gold"}}/> : null } {task.title} </span>;
        }

        // STATUS
        if ( search.length > 0 && task.status.toLowerCase()
          .includes( search.toLowerCase() ) ) {
          let startIndex = task.status.label.toLowerCase()
            .indexOf( search.toLowerCase() );
          let endIndex = startIndex + search.length;
          newTask.status = <span> {task.status.label.substring( 0, startIndex - 1 )} <span style={{ backgroundColor: "yellow" }}> {task.status.label.substring( startIndex, endIndex )} </span> {task.status.label.substring(endIndex )} </span>;
        } else {
          newTask.status = task.status.label;
        }

        // DESCRIPTION
        if ( search.length > 0 && task.description.toLowerCase()
          .includes( search.toLowerCase() ) ) {
          let startIndex = task.description.toLowerCase()
            .indexOf( search.toLowerCase() );
          let endIndex = startIndex + search.length;
          newTask.description = <span> {task.description.substring( 0, startIndex - 1 )} <span style={{ backgroundColor: "yellow" }}> {task.description.substring( startIndex, endIndex )} </span> {task.description.substring(endIndex )} </span>;
        } else {
          newTask.description = task.description;
        }

        // ASSIGNED
        newTask.assigned = task.assigned.map( assigned => {
          let fullName = `${assigned.profile.name} ${assigned.profile.surname}`;
          let startIndex = fullName.toLowerCase()
            .indexOf( search.toLowerCase() );
          let endIndex = startIndex + search.length;

          let body = fullName;
          if ( search.length > 0 && startIndex > -1 ) {
            body = ( <span> {fullName.substring( 0, startIndex )} <span style={{ backgroundColor: "yellow"}}> {fullName.substring( startIndex, endIndex )} </span> {fullName.substring(endIndex )} </span> );
          }
          return ( <span style={{display: "block"}} key={assigned._id}>{body}</span> )
        } );

        // DEADLINE
        if (!task.deadline) {
          newTask.deadline = "";
        } else {
          let date = `${moment.unix(task.deadline).add((new Date).getTimezoneOffset(), 'minutes').format("DD.MM.yyyy hh:mm")}`;
          if ( search.length > 0 && date.toLowerCase().includes( search.toLowerCase() ) ) {
            let startIndex = date.toLowerCase().indexOf( search.toLowerCase() );
            let endIndex = startIndex + search.length;
            newTask.deadline = <span> {date.substring( 0, startIndex )} <span style={{ backgroundColor: "yellow"}}> {date.substring( startIndex, endIndex )} </span> {date.substring(endIndex )} </span>;
          } else {
            newTask.deadline = date;
          }
        }

        // ACTIONS
        newTask.actions = task.actions.map( ( action, index ) => {
          let startIndex = action.title.toLowerCase()
            .indexOf( search.toLowerCase() );
          let endIndex = startIndex + search.length;

          let body = action.title;
          if ( search.length > 0 && startIndex > -1 ) {
            body = ( <span> { action.title.substring( 0, startIndex )} <span style={{ backgroundColor: "yellow"}}> { action.title.substring( startIndex, endIndex )} </span> { action.title.substring(endIndex )} </span> );
          }
          return ( <span key={action._id} style={{display: "block"}} key={action._id + "" +  index}>
            <Input
              type="checkbox"
              style={{
                marginRight: "0.2em"
              }}
              checked={action.checked}
              readOnly
              />
            {body}
          </span> )
        } );

        // DURATIONS
        newTask.duration = task.actions.map( ( action, index ) => {
          let data = action.duration && action.duration > 0 ? `${action.duration} hours` : "";
          let startIndex = data.toLowerCase()
            .indexOf( search.toLowerCase() );
          let endIndex = startIndex + search.length;

          let body = data;
          if ( search.length > 0 && startIndex > -1 ) {
            body = ( <span> { data.substring( 0, startIndex )} <span style={{ backgroundColor: "yellow"}}> { data.substring( startIndex, endIndex )} </span> {data.substring(endIndex )} </span> );
          }
          return ( <span key={action._id} style={{display: "block"}} key={action._id + "" +  index}>{body}</span> )
        } );

        // MATERIALS
        newTask.material = task.materials.map( ( material, index ) => {
          let data = `${material.title} ${material.amount ? material.amount + "pcs" : ""} ${material.price ? material.price + "eur" : ""}`;
          let startIndex = data.toLowerCase()
            .indexOf( search.toLowerCase() );
          let endIndex = startIndex + search.length;

          let body = data;
          if ( search.length > 0 && startIndex > -1 ) {
            body = ( <span> { data.substring( 0, startIndex )} <span style={{ backgroundColor: "yellow"}}> { data.substring( startIndex, endIndex )} </span> { data.substring(endIndex )} </span> );
          }
          return ( <span key={material._id} style={{display: "block"}} key={material._id + "" +  index}>
            <Input
              type="checkbox"
              style={{
                marginRight: "0.2em"
              }}
              checked={material.checked}
              readOnly
              />
            {body}
          </span> )
        } );

        return newTask;
      } )
    },
    [ globalFilteredTasks ] );


    const durationsReducer = (accumulator, action) => accumulator + (action.duration ? parseInt(action.duration) : 0);
    const actionsReducer = (acc, task) => acc + (task.actions ? task.actions.reduce(durationsReducer, 0) : 0);
    const totalHours = tasks ? tasks.reduce(actionsReducer, 0) : 0;

    const priceReducer = (accumulator, material) => accumulator + (material.price ? parseInt(material.price)*parseInt(material.amount) : 0);
    const materialsReducer = (acc, task) => acc + (task.materials ? task.materials.reduce(priceReducer, 0) : 0);
    const totalPrice = tasks ? tasks.reduce(materialsReducer, 0) : 0;

  return (
    <List>
      <h2>{(listType?.charAt(0).toUpperCase() + listType?.slice(1)).toString().replace("-", " ") + ([WHOLE_TABLE, PLANNED, IMPORTANT].includes(listType) ? " tasks" : "")}</h2>

      <SearchSection>
        <Input width="30%" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        <section key="allStatuses">
          <Input
            id="allStatuses"
            type="checkbox"
            name="allStatuses"
            style={{
              marginRight: "0.2em"
            }}
            checked={showClosed}
            onChange={() => setShowClosed(!showClosed)}
            />
          <label htmlFor="allStatuses">Show closed</label>
        </section>
      </SearchSection>

      <EditTaskContainer users={users} tags={tags} task={chosenTask} setChosenTask={setChosenTask}/>

      <table>
        <thead>
          <tr>
            {displayColumns.map(col => <th  key={col.value} width={col.width[listType]}>{col.label}</th>)}
          </tr>
        </thead>
        
        <tbody>

          <tr key="filters">
            {
              displayColumns.map(col => {
                switch (col.value) {
                  case "status":
                  return (
                    <td key={col.value}>
                      <Input value={searchStatus} onChange={(e) => setSearchStatus(e.target.value)} />
                    </td>
                  );
                  case "title":
                  return (
                    <td key={col.value}>
                      <Input value={searchTitle} onChange={(e) => setSearchTitle(e.target.value)} />
                    </td>
                  );
                  case "description":
                  return (
                    <td key={col.value}>
                      <Input value={searchDescription} onChange={(e) => setSearchDescription(e.target.value)} />
                    </td>
                  );
                  case "actions":
                  return (
                    <td key={col.value}>
                      <Input value={searchActions} onChange={(e) => setSearchActions(e.target.value)} />
                    </td>
                  );
                  case "duration":
                  return (
                    <td key={col.value}>
                      <Input value={searchDuration} onChange={(e) => setSearchDuration(e.target.value)} />
                    </td>
                  );
                  case "material":
                  return (
                    <td key={col.value}>
                      <Input value={searchMaterial} onChange={(e) => setSearchMaterial(e.target.value)} />
                    </td>
                  );
                  case "assigned":
                  return (
                    <td key={col.value}>
                      <Input value={searchAssigned} onChange={(e) => setSearchAssigned(e.target.value)} />
                    </td>
                  );
                  case "deadline":
                  return (
                    <td key={col.value}>
                      <Input value={searchDeadline} onChange={(e) => setSearchDeadline(e.target.value)} />
                    </td>
                  );
                }
              })
            }
          </tr>

          {colouredTasks.map(task =>
            <tr
              key={task.originalTask._id}
              style={listType === PLANNED && task.originalTask.deadline <= moment().unix() ? {backgroundColor: "mistyrose"} : {}}
              onClick={() => setChosenTask(task.originalTask)}
              >
              {displayColumns.map(col => (<td key={col.value}>{task[col.value]}</td>))}
            </tr>
          )}

        </tbody>
      </table>

      <span style={{display: "block"}}>{`Total duration: ${totalHours} hours`}</span>
      <span>{`Total price: ${totalPrice} eur`}</span>

    </List>
  );
};
