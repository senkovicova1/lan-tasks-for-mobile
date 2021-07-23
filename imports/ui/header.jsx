import React, {
  useState,
  useEffect
} from 'react';
import {
  Link
} from 'react-router-dom';
import { useSelector } from 'react-redux';

import MenuIcon from "../other/styles/icons/menu.svg";
import SettingsIcon from "../other/styles/icons/settings.svg";
import LogOutIcon from "../other/styles/icons/logout.svg";
import CloseIcon from "../other/styles/icons/close.svg";
import SearchIcon from "../other/styles/icons/search.svg";
import LeftArrowIcon from "../other/styles/icons/left-arrow.svg";

import Menu from './sidebar';

import {
  useTracker
} from 'meteor/react-meteor-data';
import {
  PageHeader,
  LinkButton,
  FullButton,
  SearchSection,
  Input,
} from '../other/styles/styledComponents';

export default function Header( props ) {

  const {match, location, setSearch, search, setParentOpenSidebar} = props;

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
    if (!match.params.folderID || match.params.folderID === "all") {
      setTitle("TaskApp");
      setBackground("#0078d4");
    }
    let folder = folders.find(folder => folder._id === match.params.folderID);
    if (folder) {
      setTitle(folder.name);
      setBackground(folder.colour);
    } else {
      setTitle("TaskApp");
      setBackground("#0078d4");
    }
  }, [match.params.folderID, location.pathname, folders]);

  useEffect(() => {
    if (window.innerWidth >= 800) {
      setOpenSidebar(true);
      setParentOpenSidebar(true);
    }
  }, [window.innerWidth]);

  return (
    <PageHeader style={{backgroundColor: background}} widthWithSidebar={openSidebar}>
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
          <SearchSection>
            <Input
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              />
          </SearchSection>
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
        <LinkButton
          font="white"
          onClick={(e) => {
            e.preventDefault();
            setBackground("#0078d4");
            props.history.push("/settings");
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
            src={LogOutIcon}
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
