import React from 'react';
import {
  Meteor
} from 'meteor/meteor';

import {
  useDispatch,
  useSelector
} from 'react-redux';

import {
  setSearch,
} from '/imports/redux/metadataSlice';

import {
  SettingsIcon,
  MenuIcon,
  LogoutIcon,
  CloseIcon,
  SearchIcon,
  LeftArrowIcon,
  UserIcon,
  MenuIcon2,
  FilterIcon,
  FullStarIcon,
  EmptyStarIcon,
  ClockIcon,
  CalendarIcon,
  FolderIcon
} from "/imports/other/styles/icons";

import {
  PageHeader,
  LinkButton,
  FullButton,
  SearchSection,
  Input,
  Sort,
  Filter,
  Form,
  ButtonRow,
  ButtonCol
} from '/imports/other/styles/styledComponents';

export default function Loader( props ) {

    const dispatch = useDispatch();

    const {
      match,
      location,
    } = props;

    const {
      search,
      filter
    } = useSelector( ( state ) => state.metadata.value );
    
    const [ openFilter, setOpenFilter ] = useState( false );
    const [ openSearch, setOpenSearch ] = useState( true );

      const [ newFilter, setNewFilter] = useState();
      const [ newSearch, setNewSearch] = useState("");
      const [ saveFilter, setSaveFilter] = useState(false);

  return (
    <SearchSection>
      <LinkButton
        font="#0078d4"
        searchButton
        onClick={(e) => {}}
        >
        <img
          className="search-icon"
          src={SearchIcon}
          alt="Search icon not found"
          />
      </LinkButton>
      <Input
        placeholder="Search"
        value={search}
        onChange={(e) => dispatch(setSearch(e.target.value))}
        />
      <LinkButton
        font="#0078d4"
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

    {
      openFilter &&
      <Filter>
        <Form>
          <section className="inline">
            <span className="icon-container">
              <img
                className="label-icon"
                htmlFor="title"
                src={MenuIcon}
                alt="MenuIcon icon not found"
                />
            </span>
            <Input
              type="text"
              name="title"
              id="title"
              placeholder="Filter by title"
              value={newSearch}
              onChange={(e) => {
                setNewSearch( e.target.value );
              }}
              />
          </section>

          {
            (['all', 'important'].includes(folderID)
          || filterID) &&
            <section className="inline">
              <span className="icon-container">
                <img
                  className="label-icon"
                  htmlFor="folder"
                  src={FolderIcon}
                  alt="FolderIcon icon not found"
                  />
              </span>
              <div style={{width: "100%"}}>
                <Select
                  id="folder"
                  name="folder"
                  placeholder="Filter by folders"
                  isMulti
                  styles={selectStyle}
                  value={newFilter.folders}
                  onChange={(e) => {
                    setNewFilter({...newFilter, folders: e})
                  }}
                  options={match.path.includes("archive") ? folders.archived : folders.active}
                  />
              </div>
            </section>
          }

        <section className="inline fit">
          <LinkButton
            style={{color: "#f3d053", paddingLeft: "0px"}}
            height="fit"
            onClick={(e) => {
              e.preventDefault();
              setNewFilter({...newFilter, important: !newFilter.important})
            }}
            >
            {
              newFilter.important &&
              <img
                style={{margin: "0px"}}
                className="label-icon star"
                src={FullStarIcon}
                alt="Full star icon not found"
                />
            }
            {
              !newFilter.important &&
              <img
                style={{margin: "0px"}}
                className="label-icon star"
                src={EmptyStarIcon}
                alt="Empty star icon not found"
                />
            }
            <span style={{marginLeft: "10px"}}>
              Important
            </span>
          </LinkButton>
        </section>

        <section className="inline">
          <span className="icon-container">
            <img
              className="label-icon"
              htmlFor="assigned"
              src={UserIcon}
              alt="User icon not found"
              />
          </span>
          <div style={{width: "100%"}}>
            <Select
              id="assigned"
              name="assigned"
              styles={selectStyle}
              placeholder="Filter by assigned users"
              value={newFilter.assigned}
              isMulti
              onChange={(e) => {
                setNewFilter({...newFilter, assigned: e});
              }}
              options={usersForFilter}
              />
          </div>
        </section>

        <section className="inline">
          <span className="icon-container">
            <img
              className="label-icon"
              htmlFor="datetimeMin"
              src={CalendarIcon}
              alt="Calendar icon not found"
              />
          </span>
          <Datetime
            className="full-width"
            dateFormat={"DD.MM.yyyy"}
            timeFormat={false}
            value={newFilter.datetimeMin ? moment.unix(newFilter.datetimeMin) : null}
            name="datetimeMin"
            id="datetimeMin"
            inputProps={{
            placeholder: 'Set date',
            }}
            onChange={(date) => {
              if (typeof date !== "string"){
                  setNewFilter({...newFilter, datetimeMin: date.unix()});
              } else {
                  setNewFilter({...newFilter, datetimeMin: date});
              }
            }}
            renderInput={(props) => {
                return <Input
                  {...props}
                  value={newFilter.datetimeMin ? moment.unix(newFilter.datetimeMin).format("DD.MM.yyyy").replace("T", " ") : ""}
                  />
            }}
            />
            <LinkButton
              searchButton
              style={{color: "#f3d053", height: "40px", marginRight: "0.6em"}}
              height="fit"
              onClick={(e) => {
                e.preventDefault();
                setNewFilter({...newFilter, datetimeMin: ""});
              }}
              >
                <img
                  style={{margin: "0px"}}
                  className="label-icon"
                  src={CloseIcon}
                  alt="CloseIcon star icon not found"
                  />
            </LinkButton>

            <Datetime
              className="full-width"
              dateFormat={"DD.MM.yyyy"}
              timeFormat={false}
              name="datetimeMax"
              id="datetimeMax"
              inputProps={{
              placeholder: 'Set date',
              }}
              onChange={(date) => {
                date.hours(23).minutes(59).seconds(59);
                if (typeof date !== "string"){
                    setNewFilter({...newFilter, datetimeMax: date.unix()});
                } else {
                    setNewFilter({...newFilter, datetimeMax: date});
                }
              }}
              renderInput={(props) => {
                  return <Input
                    {...props}
                    value={newFilter.datetimeMax ? moment.unix(newFilter.datetimeMax).format("DD.MM.yyyy").replace("T", " ") : ""}
                    />
              }}
              />
              <LinkButton
                searchButton
                style={{color: "#f3d053", height: "40px"}}
                height="fit"
                onClick={(e) => {
                  e.preventDefault();
                  setNewFilter({...newFilter, datetimeMax: ""});
                }}
                >
                  <img
                    style={{margin: "0px"}}
                    className="label-icon"
                    src={CloseIcon}
                    alt="CloseIcon star icon not found"
                    />
              </LinkButton>
        </section>

        <section className="inline">
          <span className="icon-container" style={{fontSize: "2em", paddingLeft: "8px"}}>
            *
          </span>
          <Datetime
            className="full-width"
            dateFormat={"DD.MM.yyyy"}
            timeFormat={false}
            name="dateCreated"
            id="dateCreated"
            inputProps={{
            placeholder: 'Set created date',
            }}
            onChange={(date) => {
              if (typeof date !== "string"){
                  setNewFilter({...newFilter, dateCreatedMin: date.unix()});
              } else {
                  setNewFilter({...newFilter, dateCreatedMin: date});
              }
            }}
            renderInput={(props) => {
                return <Input
                  {...props}
                  value={newFilter.dateCreatedMin ? moment.unix(newFilter.dateCreatedMin).format("DD.MM.yyyy").replace("T", " ") : ""}
                  />
            }}
            />
            <LinkButton
              searchButton
              style={{color: "#f3d053", height: "40px", marginRight: "0.6em"}}
              onClick={(e) => {
                e.preventDefault();
                setNewFilter({...newFilter, dateCreatedMin: ""});
              }}
              >
                <img
                  style={{margin: "0px"}}
                  className="label-icon"
                  src={CloseIcon}
                  alt="CloseIcon star icon not found"
                  />
            </LinkButton>

            <Datetime
              className="full-width"
              dateFormat={"DD.MM.yyyy"}
              timeFormat={false}
              name="dateCreated"
              id="dateCreated"
              inputProps={{
              placeholder: 'Set created date',
              }}
              onChange={(date) => {
                date.hours(23).minutes(59).seconds(59);
                if (typeof date !== "string"){
                    setNewFilter({...newFilter, dateCreatedMax: date.unix()});
                } else {
                    setNewFilter({...newFilter, dateCreatedMax: date});
                }
              }}
              renderInput={(props) => {
                  return <Input
                    {...props}
                    value={newFilter.dateCreatedMax ? moment.unix(newFilter.dateCreatedMax).format("DD.MM.yyyy").replace("T", " ") : ""}
                    />
              }}
              />
              <LinkButton
                searchButton
                style={{color: "#f3d053", height: "40px"}}
                onClick={(e) => {
                  e.preventDefault();
                  setNewFilter({...newFilter, dateCreatedMax: ""});
                }}
                >
                  <img
                    style={{margin: "0px"}}
                    className="label-icon"
                    src={CloseIcon}
                    alt="CloseIcon star icon not found"
                    />
              </LinkButton>
        </section>

        <ButtonRow>
          <LinkButton
            onClick={(e) => {
              e.preventDefault();
              setSaveFilter(true);
            }}
            >
            Save filter
          </LinkButton>
          <FullButton
            onClick={(e) => {
              e.preventDefault();
              dispatch(setSearch(newSearch));
              dispatch(setFilter({...newFilter}));
              setOpenFilter(false);
            }}
            >
            Apply filter
          </FullButton>
        </ButtonRow>

      </Form>
      </Filter>
    }
    </SearchSection>

  );
};
