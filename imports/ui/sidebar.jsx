import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  NavLink
} from 'react-router-dom';

import {
  useDispatch,
  useSelector
} from 'react-redux';

import {
  useTracker
} from 'meteor/react-meteor-data';

import moment from 'moment';

import Select from 'react-select';

import EditFilter from '/imports/ui/filters/editContainer';

import {
  setSidebarOpen,
  setLayout,
  setFilter,
  setSearch,
} from '/imports/redux/metadataSlice';

import {
  ArchiveIcon,
  ListIcon,
  FolderIcon,
  PlusIcon,
  SettingsIcon,
  UserIcon,
  MenuIcon2,
  FilterIcon,
  FullStarIcon,
  EmptyStarIcon,
  ClockIcon,
  CalendarIcon,
} from "/imports/other/styles/icons";

import {
  invisibleSelectStyle
} from '/imports/other/styles/selectStyles';

import {
  Sidebar,
  SearchSection,
  Input,
  LinkButton
} from "/imports/other/styles/styledComponents";

import {
  PLAIN,
  DND,
  allMyTasksFolder,
  importantTasksFolder,
  archivedFolder,
  calendarView
} from "/imports/other/constants";

import {
  translations
} from '/imports/other/translations';

export default function Menu( props ) {

  const dispatch = useDispatch();

  const {
    match,
    location,
    foldersLoading,
    filtersLoading,
  } = props;

  const {
    folderID,
    filterID
  } = match.params;

  const {
    layout,
    search,
  } = useSelector( ( state ) => state.metadata.value );

  const [ editFilter, setEditFilter] = useState(null);

  const userId = Meteor.userId();
  const currentUser = useTracker( () => Meteor.user() );
  const language = useMemo( () => {
    return currentUser.profile.language;
  }, [ currentUser ] );

  const folders = useSelector( ( state ) => state.folders.value );
  const users = useSelector( ( state ) => state.users.value );
  const dbFilters = useSelector( ( state ) => state.filters.value );

  const actualAllMyTasksFolder = useMemo( () => {
    return allMyTasksFolder( currentUser.profile.language );
  }, [ currentUser.profile.language ] );
  const actualImportantTasksFolder = useMemo( () => {
    return importantTasksFolder( currentUser.profile.language );
  }, [ currentUser.profile.language ] );
  const actualCalendarView = useMemo( () => {
    return calendarView( currentUser.profile.language );
  }, [ currentUser.profile.language ] );
  const actualArchivedFolder = useMemo( () => {
    return archivedFolder( currentUser.profile.language );
  }, [ currentUser.profile.language ] );

  const filters = useMemo(() => {
    return dbFilters.map(filter => ({
      ...filter,
      assigned: users && users.length > 0 ? filter.assigned.map(user => users.find(u => u._id === user)) : [],
      folders: folders && [...folders.active, ...folders.archived ].length > 0 && filter.folders ? filter.folders.map(f1 => [...folders.active, ...folders.archived ].find(f2 => f2._id === f1)) : [],
      label: filter.name,
      value: filter._id
    }))
  }, [users, folders, dbFilters]);

  return (
    <Sidebar>
      <NavLink
        key={"all"}
        to="/all/list"
        className={((!folderID && !match.path.includes("archive") && !filterID) || actualAllMyTasksFolder.value === folderID)  ? "active" : ""}
        onClick={() => {
          if (layout === DND){
            dispatch(setLayout(PLAIN));
          }
          if (/Mobi|Android/i.test(navigator.userAgent)) {
            dispatch(setSidebarOpen(false));
            dispatch(setSidebarOpen(false));
          }
        }}
        >
        <img
          className="icon"
          src={ListIcon}
          alt="List icon not found"
          />
        {actualAllMyTasksFolder.label}
      </NavLink>

      <NavLink
        key={"important"}
        to="/important/list"
        className={(actualImportantTasksFolder.value === folderID)  ? "active" : ""}
        onClick={() => {
          if (layout === DND){
            dispatch(setLayout(PLAIN));
          }
          if (/Mobi|Android/i.test(navigator.userAgent)) {
            dispatch(setSidebarOpen(false));
          }
        }}
        >
        <img
          className="icon"
          src={EmptyStarIcon}
          alt="Star icon not found"
          />
        {actualImportantTasksFolder.label}
      </NavLink>

      {
        !filtersLoading &&
        filters.map(filter => (
          <NavLink
            key={filter._id}
            className={filter._id === filterID ? "active" : ""}
            to={`/filters/${filter._id}/list`}
            onClick={() => {
              if (layout === DND){
                dispatch(setLayout(PLAIN));
              }
              if (/Mobi|Android/i.test(navigator.userAgent)) {
                dispatch(setSidebarOpen(false));
              }
            }}
            >
            <img
              className="icon"
              src={FilterIcon}
              alt="FilterIcon icon not found"
              />
            <span>{filter.label}</span>
            {
              filter._id === filterID &&
              <LinkButton
                className="left"
                style={{marginLeft: "auto"}}
                font="white"
                onClick={(e) => {
                  e.preventDefault();
                  setEditFilter(filter);
                }}
                >
                <img
                  className="icon"
                  style={{margin: "0px"}}
                  src={SettingsIcon}
                  alt="Settings icon not found"
                  />
              </LinkButton>
            }
          </NavLink>
        ))
      }

      {
        !foldersLoading &&
        folders.active.map(folder => (
          <NavLink
            key={folder._id}
            className={folder._id === folderID ? "active" : ""}
            to={`/${folder._id}/list`}
            onClick={() => {
              if (/Mobi|Android/i.test(navigator.userAgent)) {
                dispatch(setSidebarOpen(false));
              }
            }}
            >
            <img
              className="icon"
              src={FolderIcon}
              alt="Folder icon not found"
              />
            <span>{folder.label}</span>
          </NavLink>
        ))
      }
      <NavLink
        key={"add-folder"}
        to="/folders/add"
        onClick={() => {
          if (/Mobi|Android/i.test(navigator.userAgent)) {
            dispatch(setSidebarOpen(false));
          }
        }}
        >
        <img
          className="icon"
          src={PlusIcon}
          alt="Plus icon not found"
          />
        {translations[language].folder}
      </NavLink>

      <NavLink
        key={"archived"}
        to="/folders/archived"
        className={location.pathname == "/folders/archived" ? "active" : ""}
        onClick={() => {
          if (/Mobi|Android/i.test(navigator.userAgent)) {
            dispatch(setSidebarOpen(false));
          }
        }}
        >
        <img
          className="icon"
          src={ArchiveIcon}
          alt="Folder icon not found"
          />
        {actualArchivedFolder.label}
      </NavLink>


      {
        editFilter &&
        <EditFilter
          {...props}
          filterId={editFilter._id}
          setEditFilter={setEditFilter}
          />
      }

    </Sidebar>
  );
};
