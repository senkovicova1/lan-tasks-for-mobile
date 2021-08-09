import React, {
  useState,
  useEffect,
  useMemo
} from 'react';
import {
  Link
} from 'react-router-dom';
import { useSelector } from 'react-redux';

import { SettingsIcon, MenuIcon, LogoutIcon, CloseIcon, SearchIcon, LeftArrowIcon, UserIcon } from  "/imports/other/styles/icons";

import Menu from './sidebar';

import {
  useTracker
} from 'meteor/react-meteor-data';

import {
  uint8ArrayToImg
} from '/imports/other/helperFunctions';
import {
  MobilePageHeader as PageHeader,
  LinkButton,
  FullButton,
  Input,
  TitleControl
} from '../other/styles/styledComponents';

export default function MobileHeader( props ) {

  const {
    match,
    location,
    setSearch,
    search,
    setParentOpenSidebar
  } = props;

  const folderID = match.params.folderID;

  const currentUser = useTracker( () => Meteor.user() );
  const logout = () => Meteor.logout();

  const folders = useSelector((state) => state.folders.value);

  const [ openSidebar, setOpenSidebar ] = useState(false);
  const [ openSearch, setOpenSearch ] = useState(false);
  const [ title, setTitle ] = useState("TaskApp");
  const [ background, setBackground ] = useState("#0078d4");

  useEffect(() => {
    if (location.pathname === "/folders/archived") {
      setTitle("Archived Folders");
      setBackground("#0078d4");
    }
    if (!folderID || folderID === "all") {
      setTitle("TaskApp");
      setBackground("#0078d4");
    }
    let folder = folders.find(folder => folder._id === folderID);
    if (folder) {
      setTitle(folder.name);
      setBackground(folder.colour);
    } else {
      setTitle("TaskApp");
      setBackground("#0078d4");
    }
  }, [folderID, location.pathname, folders]);

  const avatar = useMemo(() => {
    if (!currentUser || !currentUser.profile.avatar){
      return null;
    }
    return uint8ArrayToImg(currentUser.profile.avatar);
  }, [currentUser])

  const canEditFolder = folderID && folderID !== 'all' && folders.length > 0 ? folders.find(f => f._id === folderID).users.find(user => user._id === currentUser._id).admin : false;

  return (
    <PageHeader style={{backgroundColor: background}}>
        {
          currentUser &&
          <LinkButton
            font="white"
            onClick={(e) => {
              e.preventDefault();
              setOpenSidebar(!openSidebar);
              setParentOpenSidebar(!openSidebar);
            }}
            >
            <img
              className="icon"
              src={MenuIcon}
              alt="Menu icon not found"
              />
          </LinkButton>
        }
        {
          !openSearch &&
          <h1 onClick={(e) => props.history.push("/all/list")}>{title}</h1>
        }

      {
        openSearch &&
        currentUser &&
          <LinkButton
            font="white"
            onClick={(e) => {
              e.preventDefault();
              setOpenSearch(false);
            }}
            >
            <img
              className="icon"
              src={LeftArrowIcon}
              alt="Left arrow icon not found"
              />
          </LinkButton>
        }
          {
            openSearch &&
            currentUser &&
          <div className="search-section">
          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            />
        </div>
      }
      {
        openSearch &&
        currentUser &&
        <LinkButton
          font="#0078d4"
          searchButton
          onClick={(e) => {
            e.preventDefault();
            setSearch("");
          }}
          >
          <img
            className="search-icon"
            src={CloseIcon}
            alt="Close icon not found"
            />
        </LinkButton>
  }

      {
        !openSearch &&
        currentUser &&
        <LinkButton
          style={{marginLeft: "auto"}}
          font="white"
          onClick={(e) => {
            e.preventDefault();
            setOpenSearch(true);
          }}
          >
          <img
            className="icon"
            src={SearchIcon}
            alt="Search icon not found"
            />
        </LinkButton>
      }

      {
        currentUser &&
        (!folderID || folderID === "all") &&
        <LinkButton
          font="white"
          onClick={(e) => {
            e.preventDefault();
            setBackground("#0078d4");
            props.history.push("/settings");
          }}
          >
          {
            avatar &&
          <img className="avatar" src={avatar} alt="assignedAvatar" />
          }
          {
            !avatar &&
            <img className="icon" src={UserIcon} alt="assignedAvatar" />
          }
        </LinkButton>
      }

      {
        currentUser &&
        canEditFolder &&
        <LinkButton
          font="white"
          onClick={(e) => {
            e.preventDefault();
            setBackground("#0078d4");
            props.history.push(`/${folderID}/edit`);
          }}
          >
          <img
            className="icon"
            src={SettingsIcon}
            alt="Settings icon not found"
            />
        </LinkButton>
      }

      {
        currentUser &&
        <LinkButton
          font="white"
          onClick={(e) => {
            e.preventDefault();
            setBackground("#0078d4");
            props.history.push("/login");
            logout();
          }}
          >
          <img
            className="icon"
            src={LogoutIcon}
            alt="Logout icon not found"
            />
        </LinkButton>
      }

      {
        openSidebar &&
        currentUser &&
        <Menu {...props} setBackground={setBackground} widthWithSidebar={openSidebar} closeSelf={() => setOpenSidebar(false)}/>
      }

    </PageHeader>
  );
};
