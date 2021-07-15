import React, {
  useState,
  useEffect
} from 'react';
import {
  Link
} from 'react-router-dom';
import { useSelector } from 'react-redux';

import {
  Icon
} from '@fluentui/react/lib/Icon';

import Menu from './sidebar';

import {
  PageHeader,
  LinkButton,
  FullButton,
  SearchSection,
  Input,
} from '../other/styles/styledComponents';

export default function Header( props ) {

  const {setBackground, match, location, setSearch, search} = props;

  const logout = () => Meteor.logout();

  const folders = useSelector((state) => state.folders.value);

  const [ openSidebar, setOpenSidebar ] = useState(false);
  const [ openSearch, setOpenSearch ] = useState(false);
  const [ title, setTitle ] = useState("TaskApp");

  useEffect(() => {
    if (location.pathname === "/folders/archived") {
        setTitle("Archived Folders");
        setBackground("#f6f6f6");
    }
    if (!match.params.folderID || match.params.folderID === "all") {
      setTitle("TaskApp");
      setBackground("#f6f6f6");
    }
    let folder = folders.find(folder => folder._id === match.params.folderID);
    if (folder) {
      setTitle(folder.name);
      setBackground(folder.colour);
    } else {
      setTitle("TaskApp");
      setBackground("#f6f6f6");
    }
  }, [match.params.folderID, location.pathname, folders]);

  return (
    <PageHeader>
      {
        !props.location.pathname.includes("login") &&
      <LinkButton
        font="white"
        onClick={(e) => {
          e.preventDefault();
          setOpenSidebar(!openSidebar);
        }}
        >
        <Icon  iconName="GlobalNavButton" />
      </LinkButton>
    }
      {
        !openSearch &&
      <h1 onClick={(e) => props.history.push("/all/list")}>{title}</h1>
    }

    {
      openSearch &&
      !props.location.pathname.includes("login") &&
      <LinkButton
        font="white"
        onClick={(e) => {
          e.preventDefault();
          setOpenSearch(false);
        }}
        >
        <Icon iconName="Reply"/>
      </LinkButton>
    }
        {
          openSearch &&
          !props.location.pathname.includes("login") &&
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
          !props.location.pathname.includes("login") &&
          <LinkButton
            font="#0078d4"
            searchButton
            onClick={(e) => {
              e.preventDefault();
              setSearch("");
            }}
            >
            <Icon iconName="Cancel"/>
          </LinkButton>
        }

        {
          !openSearch &&
          !props.location.pathname.includes("login") &&
          <LinkButton
            style={{marginLeft: "auto"}}
            font="white"
            onClick={(e) => {
              e.preventDefault();
              setOpenSearch(true);
            }}
            >
            <Icon iconName="Zoom"/>
          </LinkButton>
        }

      {
        !props.location.pathname.includes("login") &&
        <LinkButton
          font="white"
          onClick={(e) => {
            e.preventDefault();
            setBackground("#f6f6f6");
            props.history.push("/settings");
          }}
          >
          <Icon  iconName="Settings" />
        </LinkButton>
      }
      {
        !props.location.pathname.includes("login") &&
        <LinkButton
          font="white"
          onClick={(e) => {
            e.preventDefault();
            setBackground("#f6f6f6");
            props.history.push("/login");
            logout();
          }}
          >
          <Icon  iconName="SignOut" />
        </LinkButton>
      }

      {
        openSidebar &&
        !props.location.pathname.includes("login") &&
        <Menu {...props} setBackground={setBackground} closeSelf={() => setOpenSidebar(false)}/>
      }

    </PageHeader>
  );
};
