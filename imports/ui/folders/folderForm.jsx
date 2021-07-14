import React, {
  useState,
  useMemo,
  useEffect,
} from 'react';

import {
  useTracker
} from 'meteor/react-meteor-data';

import Select from 'react-select';

import {
  selectStyle
} from '../../other/styles/selectStyles';

import {
  translations
} from '../../other/translations.jsx';

import {
  Icon
} from '@fluentui/react/lib/Icon';


import {
  Form,
  Input,
  ButtonRow,
  LinkButton,
  FullButton,
  UserEntry
} from "../../other/styles/styledComponents";

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

const dbUsers = useTracker( () => Meteor.users.find( {} )
  .fetch() );

const userId = Meteor.userId();

  const [ name, setName ] = useState( "" );
  const [ archived, setArchived ] = useState( false );
  const [ colour, setColor ] = useState( "#FFFFFF" );
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
      setColor( "#FFFFFF" );
    }

    if ( folderUsers ) {
      setUsers( folderUsers );
    } else {
      setUsers( [{_id: userId, admin: true}] );
    }

  }, [ folderName, folderArchived, folderColor, folderUsers ] );

  const usersWithRights = useMemo(() => {
   return users.map(user =>
        {
        let newUser = {...dbUsers.find(u => u._id === user._id).profile, ...user};
        const blob = new Blob([newUser.avatar], {type:"image/jpeg"} );
        const img = URL.createObjectURL(blob);
        newUser.img = img;
        return newUser;
      });
  }, [users, dbUsers]);

  const usersToSelect = useMemo(() => {
    return dbUsers.filter(user => !users.find(u => u._id === user._id)).map(user => {
      const blob = new Blob([user.profile.avatar], {type:"image/jpeg"} );
      const img = URL.createObjectURL(blob);
      return {...user.profile, _id: user._id, admin: false, label: `${user.profile.name} ${user.profile.surname}`, value: user._id, img};
    }
  );
  }, [dbUsers, users]);

  const language = useMemo(() => {
    return dbUsers.find(user => user._id === userId).profile.language;
  }, [userId, dbUsers]);

  return (
    <Form>

      <section>
        <label htmlFor="name">{translations[language].name}</label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Enter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          />
      </section>

      <section>
        <label  htmlFor="colour">{translations[language].colour}</label>
        <Input
          type="color"
          name="colour"
          id="colour"
          placeholder="Choose colour"
          value={colour}
          onChange={(e) => setColor(e.target.value)}
          />
      </section>

      <section>
        <Input
          id="archived"
          name="archived"
          type="checkbox"
          checked={archived}
          onChange={(e) =>  setArchived(!archived)}
          />
        <label htmlFor="archived">{translations[language].archived}</label>
      </section>

      <section>
          <label htmlFor="users">{translations[language].users}</label>
          {
            usersWithRights.map(user =>
              <UserEntry key={user._id}>
                {user.avatar &&
              <img src={user.img} alt="" />
            }
              <div>
              <label className="name">
              {`${user.name} ${user.surname}`}
            </label>
            <label className="role">
              {user.admin ? translations[language].admin : translations[language].user}
            </label>
          </div>
              {
                !user.admin &&
              <LinkButton onClick={(e) => {e.preventDefault(); setUsers(users.filter(u => u._id !== user._id))}}><Icon iconName="Delete"/></LinkButton>
            }
            </UserEntry>)
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

      <ButtonRow>
        <FullButton colour="grey" onClick={(e) => {e.preventDefault(); onCancel();}}>{translations[language].cancel}</FullButton>
        {onRemove &&
          <FullButton colour="red" onClick={(e) => {e.preventDefault(); onRemove(folderId); onCancel();}}>{translations[language].delete}</FullButton>
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
      </ButtonRow>

    </Form>
  );
};
