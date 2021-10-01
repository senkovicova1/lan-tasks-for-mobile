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

import {
  setSidebarOpen
} from '/imports/redux/metadataSlice';

import {
  ListIcon,
  FolderIcon,
  ArchiveIcon,
  PlusIcon
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
  allMyTasksFolder,
  archivedFolder
} from "/imports/other/constants";

import {
  translations
} from '/imports/other/translations';

export default function Menu( props ) {

  const dispatch = useDispatch();

  const {
    match,
    location,
  } = props;

  const {
    folderID
  } = match.params;
  const folders = useSelector( ( state ) => state.folders.value ).active;
  const currentUser = useTracker( () => Meteor.user() );
  const userId = Meteor.userId();

  const actualAllMyTasksFolder = useMemo( () => {
    return allMyTasksFolder( currentUser.profile.language );
  }, [ currentUser.profile.language ] );
  const actualArchivedFolder = useMemo( () => {
    return archivedFolder( currentUser.profile.language );
  }, [ currentUser.profile.language ] );

  return (
    <Sidebar>
      <NavLink
        key={"all"}
        to="/all/list"
        className={(!folderID || actualAllMyTasksFolder.value === folderID)  ? "active" : ""}
        onClick={() => {
          if (/Mobi|Android/i.test(navigator.userAgent)) {
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

      {
        folders.map(folder => (
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
        Folder
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
    </Sidebar>
  );
};
