import React, {
  useState,
  useMemo
} from 'react';
import {
  Link
} from 'react-router-dom';

import {
  Icon
} from '@fluentui/react/lib/Icon';

import Menu from './sidebar';

import {
  PageHeader,
  LinkButton,
  SearchSection,
  Input,
} from '../other/styles/styledComponents';

import {
  FoldersCollection
} from '/imports/api/foldersCollection';
import {
  useTracker
} from 'meteor/react-meteor-data';

export default function Header( props ) {

  const {setBackground, match, location, setSearch, search} = props;

  const logout = () => Meteor.logout();
  const folders = useTracker( () => FoldersCollection.find( {} ).fetch() );

  const [ openSidebar, setOpenSidebar ] = useState(false);
  const [ openSearch, setOpenSearch ] = useState(false);

  const title = useMemo(() => {
    if (location.pathname === "/folders/archived") {
        return "Archived Folders";
    }
    if (!match.params.folderID || match.params.folderID === "all") {
      return "TaskApp";
    }
    return folders.find(folder => folder._id === match.params.folderID)?.name;
  }, [match.params.folderID, location.pathname]);

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
          openSearch &&
          !props.location.pathname.includes("login") &&
          <LinkButton
            font="white"
            onClick={(e) => {
              e.preventDefault();
              setSearch("");
            }}
            >
            <Icon iconName="Cancel"/>
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
        <Menu {...props} folders={folders} setBackground={setBackground} closeSelf={() => setOpenSidebar(false)}/>
      }

    </PageHeader>
  );
};
