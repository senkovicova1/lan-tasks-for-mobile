import React, {
  useState,
  useMemo,
  useEffect,
} from 'react';
import {
  useSelector
} from 'react-redux';
import Select from 'react-select';

import {
  DeleteIcon,
  UserIcon
} from "/imports/other/styles/icons";
import {
  selectStyle
} from '/imports/other/styles/selectStyles';
import {
  Form,
  Input,
  ButtonCol,
  LinkButton,
  FullButton,
  UserEntry,
  Color
} from "/imports/other/styles/styledComponents";

import {
  colours
} from '/imports/other/constants';

import {
  translations
} from '/imports/other/translations';

export default function FolderForm( props ) {

  const {
    _id: folderId,
    name: folderName,
    archived: folderArchived,
    colour: folderColor,
    users: folderUsers,
    onSubmit,
    onRemove,
    onCancel,
    match,
    location
  } = props;

  const userId = Meteor.userId();
  const dbUsers = useSelector( ( state ) => state.users.value );

  const [ name, setName ] = useState( "" );
  const [ archived, setArchived ] = useState( false );
  const [ colour, setColor ] = useState( "#0078D4" );
  const [ users, setUsers ] = useState( [] );

  useEffect( () => {

    if ( folderName ) {
      setName( folderName );
    } else {
      setName( "" );
    }

    if ( folderArchived ) {
      setArchived( folderArchived );
    } else {
      setArchived( false );
    }

    if ( folderColor ) {
      setColor( folderColor );
    } else {
      setColor( "#0078D4" );
    }

    if ( folderUsers ) {
      setUsers( folderUsers );
    } else {
      setUsers( [ {
        _id: userId,
        admin: true
      } ] );
    }

  }, [ folderName, folderArchived, folderColor, folderUsers ] );

  const usersWithRights = useMemo( () => {
    return users.map( user => {
      return {
        ...dbUsers.find( u => u._id === user._id ),
        ...user
      };
    } );
  }, [ users, dbUsers ] );

  const usersToSelect = useMemo( () => {
    return dbUsers.filter( user => !users.find( u => u._id === user._id ) );
  }, [ dbUsers, users ] );

  const language = useMemo( () => {
    if (dbUsers.length > 0){
    return dbUsers.find( user => user._id === userId ).language;
  }
  return "en";
  }, [ userId, dbUsers ] );

  document.onkeydown = function( e ) {
    e = e || window.event;
    switch ( e.which || e.keyCode ) {
      case 13:
        if ( name.length > 0 ) {
          onSubmit(
            name,
            colour,
            archived,
            users.map( user => ( {
              _id: user._id,
              admin: user.admin
            } ) )
          );
        }
        break;
    }
  };

  return (
    <Form>

      <section>
        <label htmlFor="name">{translations[language].name}</label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder={translations[language].enterName}
          value={name}
          onChange={(e) => setName(e.target.value)}
          />
      </section>

      <section className="color-picker">
        <label  htmlFor="colours">{translations[language].colour}</label>
        <div className="colours">
          {
            colours.slice(0,5).map(colourToChoose => (
              <Color key={colourToChoose} active={colourToChoose === colour && true} className="colour" style={{backgroundColor: colourToChoose}} onClick={() => setColor(colourToChoose)}>
              </Color>
            ))
          }
        </div>
        <div className="colours">
          {
            colours.slice(5,10).map(colourToChoose => (
              <Color key={colourToChoose} active={colourToChoose === colour && true} className="colour" style={{backgroundColor: colourToChoose}} onClick={() => setColor(colourToChoose)}>
              </Color>
            ))
          }
        </div>
        <div className="colours">
          {
            colours.slice(10,15).map(colourToChoose => (
              <Color key={colourToChoose} active={colourToChoose === colour && true} className="colour" style={{backgroundColor: colourToChoose}} onClick={() => setColor(colourToChoose)}>
              </Color>
            ))
          }
        </div>
      </section>

      <section>
        <Input
          id="archived"
          name="archived"
          type="checkbox"
          className="big-checkbox"
          checked={archived}
          onChange={(e) =>  setArchived(!archived)}
          />
        <label htmlFor="archived">{translations[language].archived}</label>
      </section>

      <section>
        <label htmlFor="users">{translations[language].users}</label>
        {
          usersWithRights.map(user => (
            <UserEntry key={user._id}>
              {user.avatar &&
                <img className="avatar" src={user.img} alt="" />
              }
              {!user.avatar &&
                <img className="avatar" src={UserIcon} alt="" />
              }
              <div>
                <label className="name">
                  {`${user.name} ${user.surname}`}
                </label>
                <label className="role" onClick={() => {
                    const newUsers = users.map(u => {
                      if (u._id !== user._id){
                        return {...u};
                      }
                      if (u.admin){
                        return {...u, admin: false};
                      }
                      return {...u, admin: true};
                    })
                    setUsers(newUsers);
                  }}
                  >
                  {user.admin ? translations[language].admin : translations[language].user}
                  { user._id !== userId && ` (${translations[language].clickToChange} ${user.admin ? translations[language].user : translations[language].admin})` }
                </label>
              </div>
              {
                user._id !== userId &&
                <LinkButton
                  onClick={(e) => {e.preventDefault(); setUsers(users.filter(u => u._id !== user._id))}}
                  >
                  <img
                    className="icon"
                    src={DeleteIcon}
                    alt="Delete icon not found"
                    />
                </LinkButton>
              }
            </UserEntry>
          ))
        }
      </section>

      <section>
        <Select
          styles={selectStyle}
          onChange={(e) => {
            setUsers([...users, {_id: e._id, admin: false}]);
          }}
          options={usersToSelect}
          />
      </section>

      <ButtonCol>
        <FullButton colour="grey" onClick={(e) => {e.preventDefault(); onCancel();}}>{translations[language].cancel}</FullButton>
        {
          onRemove &&
          <FullButton colour="red" onClick={(e) => {e.preventDefault(); onRemove(folderId); }}>{translations[language].delete}</FullButton>
        }
        <FullButton
          colour=""
          disabled={name.length === 0}
          onClick={(e) => {
            e.preventDefault();
            onSubmit(
              name,
              colour,
              archived,
              users.map(user => ({_id: user._id, admin: user.admin}))
            );
          }}
          >
          {translations[language].save}
        </FullButton>
      </ButtonCol>

    </Form>
  );
};
