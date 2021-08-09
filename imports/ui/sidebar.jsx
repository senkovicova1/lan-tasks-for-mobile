import React, {
  useState,
  useMemo,
  useEffect
} from 'react';

import { NavLink } from 'react-router-dom';

import moment from 'moment';

import Select from 'react-select';

import { useSelector } from 'react-redux';

import { ListIcon, FolderIcon, ArchiveIcon } from  "/imports/other/styles/icons";

import {
  invisibleSelectStyle
} from '../other/styles/selectStyles';

import {
  translations
} from '../other/translations.jsx';

import {
  useTracker
} from 'meteor/react-meteor-data';

import {
  Sidebar,
  SearchSection,
  Input,
  LinkButton
} from "../other/styles/styledComponents";

export default function Menu( props ) {

  const {
    match,
    location,
    setBackground,
    closeSelf
  } = props;

  const userId = Meteor.userId();
  const user = useTracker( () => Meteor.user() );
  const language = useMemo(() => {
    return user.profile.language;
  }, [user]);
    const folders = useSelector((state) => state.folders.value);

  const [ search, setSearch ] = useState( "" );
  const [ showClosed, setShowClosed ] = useState(false);
  const [ openEdit, setOpenEdit ] = useState(false);
  const [ folderListOpen, setFolderListOpen ] = useState(false);
  const [ selectedFolder, setSelectedFolder ] = useState({label: translations[language].allFolders, value: "all"});

  const myFolders = useMemo(() => {
    let newMyFolders = folders.filter(folder => folder.users.find(user => user._id === userId));
    newMyFolders = newMyFolders.map(folder => ({...folder, label: folder.name, value: folder._id}));
    return newMyFolders;
  }, [userId, folders]);

  const myActiveFolders = useMemo(() => {
    return [{label: translations[language].allFolders, value: "all"}, ...myFolders.filter(folder => !folder.archived), {label: translations[language].archivedFolders, value: "archived"}];
  }, [myFolders]);

  useEffect(() => {
    if (!match.params.folderID || match.params.folderID === "all"){
      setSelectedFolder({label: translations[language].allFolders, value: "all"});
      setBackground("#0078d4");
    } else if (location.pathname == "/folders/archived"){
      setSelectedFolder({label: translations[language].archivedFolders, value: "archived"});
      setBackground("#0078d4");
    } else if (myFolders && myFolders.length > 0){
      const newFolder = myFolders.find(folder => folder._id === match.params.folderID);
      setBackground(newFolder.colour);
      setSelectedFolder(newFolder);
  } else {
    setSelectedFolder({label: translations[language].allFolders, value: "all"});
    setBackground("#0078d4");
  }
}, [match.params.folderID, location.pathname, language, myFolders]);

  return (
    <Sidebar>
      {
        myActiveFolders.map(folder => {
          if (folder.value === "archived"){
            return (
              <NavLink
                key={folder.value}
                to="/folders/archived"
                onClick={() => {
                  setBackground("#0078d4");
                  if (/Mobi|Android/i.test(navigator.userAgent)) {
                    closeSelf();
                  }
                }}
                >
                <img
                  className="icon"
                  src={ArchiveIcon}
                  alt="Folder icon not found"
                  />
                {folder.label}
              </NavLink>
            );
          }
          return (
            <NavLink
              key={folder.value}
              to={`/${folder.value}/list`}
              onClick={() => {
                setBackground(folder.colour ? folder.colour : "#0078d4");
                if (/Mobi|Android/i.test(navigator.userAgent)) {
                  closeSelf();
                }
              }}
              >
              {
                folder.value === "all" &&
                <img
                  className="icon"
                  src={ListIcon}
                  alt="List icon not found"
                  />
              }
              {
                folder.value !== "all" &&
                <img
                  className="icon"
                  src={FolderIcon}
                  alt="Folder icon not found"
                  />
              }
              <span>{folder.label}</span>
            </NavLink>
          );
        })
      }
    </Sidebar>
  );
};
