import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useDispatch,
  useSelector
} from 'react-redux';

import {
  useTracker
} from 'meteor/react-meteor-data';

import Menu from './sidebar';
import Search from '/imports/ui/other/search';
import SortAndLayout from '/imports/ui/other/sortAndLayout';
import NotificationsList from '/imports/ui/other/notifications';

import {
  setSidebarOpen,
} from '/imports/redux/metadataSlice';

import {
  BellIcon,
  CloseIcon,
  LogoutIcon,
  MenuIcon,
  MenuIcon2,
  SettingsIcon,
  UserIcon,
} from "/imports/other/styles/icons";

import {
  PageHeader,
  LinkButton,
} from '/imports/other/styles/styledComponents';

import {
  uint8ArrayToImg
} from '/imports/other/helperFunctions';

export default function WebHeader( props ) {

  const dispatch = useDispatch();

  const {
    match,
    location,
  } = props;

  const { folderID, filterID } = match.params;
  const userId = Meteor.userId();
  const currentUser = useTracker( () => Meteor.user() );
  const logout = () => Meteor.logout();

  const {
    folder,
    sidebarOpen,
  } = useSelector( ( state ) => state.metadata.value );

  const folders = useSelector( ( state ) => state.folders.value );
  const users = useSelector( ( state ) => state.users.value );

  const [ title, setTitle ] = useState( "TaskApp" );
  const [ background, setBackground ] = useState( "#0078d4" );

  const [ openSort, setOpenSort ] = useState( false );
  const [ openSearch, setOpenSearch ] = useState( true );
  const [ openNotifications, setOpenNotifications ] = useState( false );

  useEffect( () => {

    if ( location.pathname === "/folders/archived" ) {
      setTitle( "Archived Folders" );
      setBackground( "#0078d4" );
    }

    if ( !folderID || folderID === "all" ) {
      setTitle( "TaskApp" );
      setBackground( "#0078d4" );
    }

    if ( folderID === "important" ) {
      setTitle( "Important tasks" );
      setBackground( "#0078d4" );
    }

    let folder = [ ...folders.active, ...folders.archived ].find( folder => folder._id === folderID );
    if ( folder ) {
      setTitle( folder.name );
      setBackground( folder.colour );
    } else {
      setTitle( "TaskApp" );
      setBackground( "#0078d4" );
    }

  }, [ folderID, location.pathname, folders ] );

  const canEditFolder = useMemo( () => {
    if ( folderID && !['all', 'important'].includes(folderID) && [ ...folders.active, ...folders.archived ].length > 0 ) {
      const folder = [ ...folders.active, ...folders.archived ].find( f => f._id === folderID );
      const user = folder.users.find( user => user._id === userId );
      return user.admin;
    }
  }, [ folders, folderID, userId ] );

  document.addEventListener( "click", ( evt ) => {
    const sortMenu = document.getElementById( "sort-menu" );
    const openSortMenuBtn = document.getElementById( "sort-menu-button" );
    let targetElement = evt.target; // clicked element
    do {
      if ( targetElement == sortMenu ) {
        // This is a click inside. Do nothing, just return.
        return;
      }
      if ( targetElement == openSortMenuBtn ) {
        setOpenSort( !openSort );
        return;
      }
      // Go up the DOM
      targetElement = targetElement.parentNode;
    } while ( targetElement );

    // This is a click outside.
    setOpenSort( false );
  } );

  useEffect( () => {
    if ( window.innerWidth >= 800 ) {
      dispatch( setSidebarOpen( true ) );
    } else {
      dispatch( setSidebarOpen( false ) );
    }
  }, [ window.innerWidth ] );

  const avatar = useMemo( () => {
    if ( !currentUser || !currentUser.profile.avatar ) {
      return UserIcon;
    }
    return uint8ArrayToImg( currentUser.profile.avatar );
  }, [ currentUser ] );

  return (
    <PageHeader
      id="filter" style={{backgroundColor: background}}>
      <section className="header-section">
        {
          currentUser &&
          <LinkButton
            font="white"
            onClick={(e) => {
              e.preventDefault();
              dispatch(setSidebarOpen(!sidebarOpen));
            }}
            >
            <img
              className="icon"
              src={MenuIcon}
              alt="Menu icon not found"
              />
          </LinkButton>
        }
        <h1 onClick={(e) => props.history.push("/all/list")}>{title}</h1>
      </section>

      {
        currentUser &&
        <Search {...props} />
      }

      <section className="header-section" style={{justifyContent: "flex-end"}}>
        {
          currentUser &&
          <LinkButton
            font="white"
            id="sort-menu-button"
            name="sort-menu-button"
            onClick={(e) => {
              e.preventDefault();
              setOpenSort(!openSort);
            }}
            >
            <img
              className="icon"
              src={MenuIcon2}
              alt="MenuIcon2 icon not found"
              />
          </LinkButton>
        }

        {
          currentUser &&
          <LinkButton
            font="white"
            onClick={(e) => {
              e.preventDefault();
              setOpenNotifications(!openNotifications);
            }}
            >
            <img
              className="icon"
              src={BellIcon}
              alt="BellIcon icon not found"
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
            <img className={avatar === UserIcon ? "icon" : "avatar"} src={avatar} alt="assignedAvatar" />
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
              setOpenSort(false);
              setOpenSearch(false);
              setOpenNotifications(false);
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
      </section>

      {
        sidebarOpen &&
        currentUser &&
        <Menu {...props} widthWithSidebar={sidebarOpen} setBackground={setBackground} closeSelf={() => setSidebarOpen(false)}/>
      }

      {
        openSort &&
        <SortAndLayout {...props} setOpenSort={setOpenSort} />
      }

      {
        openNotifications &&
        <NotificationsList {...props} setOpenNotifications={setOpenNotifications} />
      }

    </PageHeader>
  );
};
