import React, {
  useEffect,
  useState,
  useMemo
} from 'react';

import {
  useDispatch,
  useSelector
} from 'react-redux';

import {
  useTracker
} from 'meteor/react-meteor-data';

import Menu from '/imports/ui/sidebar';
import Filter from '/imports/ui/filters/setContainer';
import SortAndLayout from '/imports/ui/other/sortAndLayout';

import {
  setSearch,
  setSidebarOpen,
} from '/imports/redux/metadataSlice';

import {
  CloseIcon,
  FilterIcon,
  LeftArrowIcon,
  LogoutIcon,
  MenuIcon,
  MenuIcon2,
  SearchIcon,
  SettingsIcon,
  UserIcon,
} from "/imports/other/styles/icons";

import {
  MobilePageHeader as PageHeader,
  LinkButton,
  Input,
} from '/imports/other/styles/styledComponents';

import {
  uint8ArrayToImg
} from '/imports/other/helperFunctions';

export default function MobileHeader( props ) {

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
    search,
  } = useSelector( ( state ) => state.metadata.value );

  const folders = useSelector( ( state ) => state.folders.value );
  const users = useSelector( ( state ) => state.users.value );

  const [ title, setTitle ] = useState( "TaskApp" );
  const [ background, setBackground ] = useState( "#0078d4" );

  const [ openSort, setOpenSort ] = useState( false );
  const [ openFilter, setOpenFilter ] = useState( false );
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

    useEffect(() => {
      document.addEventListener( "click", ( evt ) => {
        let targetElement = evt.target; // clicked element
        const itemsInMenu = [
          "sort-menu-button",
          "sort-menu-icon",
          "sort-menu",
          "sort-header-1",
          "sort-header-2",
          "sort-menu-plain-layout",
          "plain-layout",
          "plain-layout-label",
          "sort-menu-columns-layout",
          "columns-layout",
          "columns-layout-label",
          "sort-menu-calendar-layout",
          "calendar-layout",
          "calendar-layout-label",
          "sort-menu-dnd-layout",
          "dnd-layout",
          "dnd-layout-label",
          "sort-menu-custom-order",
          "customOrder",
          "custom-order-label",
        ];
        if (!itemsInMenu.includes(targetElement.id) && !targetElement.id.includes("order")){
          setOpenSort(false);
          return;
        }
      } );
    }, []);


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
    <PageHeader style={{backgroundColor: background}}>
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
            onChange={(e) => dispatch(setSearch(e.target.value))}
            />
        </div>
      }
      {
        openSearch &&
        currentUser &&
        <LinkButton
          font="#0078d4"
          style={{marginRight: "0px"}}
          searchButton
          onClick={(e) => {
            e.preventDefault();
            dispatch(setSearch(""));
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
        openSearch &&
        currentUser &&
      <LinkButton
        font="#0078d4"
        searchButton
        onClick={(e) => {
          e.preventDefault();
          const filterState = openFilter;
          setOpenFilter(!filterState);
          if (!filterState){
            setNewFilter({...filter});
            setNewSearch(search);
          }
        }}
        >
        <img
          className="search-icon"
          src={FilterIcon}
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
        openFilter &&
        <Filter {...props}  setOpenFilter={setOpenFilter} />
      }

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
        sidebarOpen &&
        currentUser &&
        <Menu {...props} setBackground={setBackground} widthWithSidebar={sidebarOpen}/>
      }

      {
        openSort &&
        <SortAndLayout {...props} setOpenSort={setOpenSort} />
      }

      {
        openNotifications &&
        <NotificationsList
          {...props}
          setOpenNotifications={setOpenNotifications}
          tasksHandlerReady={props.tasksHandlerReady}
          />
      }


    </PageHeader>
  );
};
