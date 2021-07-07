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
  Icon
} from '@fluentui/react/lib/Icon';

import {
  UsersCollection
} from '/imports/api/usersCollection';

import {
  Form,
  Input,
  ButtonRow,
  LinkButton,
  FullButton,
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
  } = props;


const dbUsers = useTracker( () => Meteor.users.find( {} )
  .fetch() );

const userId = Meteor.userId();

  const [ name, setName ] = useState( "" );
  const [ archived, setArchived ] = useState( false );
  const [ colour, setColor ] = useState( "#FFFFFF" );
  const [ users, setUsers ] = useState( [] );
  const [ allUsers, setAllUsers ] = useState( [] );

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

    let allNewUsers = [];
    let newUsers = [];
    if ( folderUsers ) {
      let newUsers = folderUsers.map(user =>
        {
        let newUser = {...dbUsers.find(u => u._id === user._id).profile, ...user};
        const blob = new Blob([newUser.avatar], {type:"image/jpeg"} );
        const img = URL.createObjectURL(blob);
        newUser.img = img;
        return newUser;
      });
    } else {
      const owner = {...dbUsers.find(user => user._id === userId).profile, _id: userId};
      const blob = new Blob([owner.avatar], {type:"image/jpeg"} );
      const img = URL.createObjectURL(blob);

      newUsers = [ {...owner, admin: true, img} ];
    }

    allNewUsers = dbUsers.map(user => {
      const blob = new Blob([user.profile.avatar], {type:"image/jpeg"} );
      const img = URL.createObjectURL(blob);
      return {...user.profile, _id: user._id, admin: false, label: `${user.profile.name} ${user.profile.surname}`, value: user._id, img};
    });

    setUsers( newUsers );
    setAllUsers(allNewUsers);
  }, [ folderName, folderArchived, folderColor, folderUsers ] );

  const usersToSelect = allUsers.filter(user => !users.find(u => u._id === user._id));
  const userIsAdmin = useMemo(() => {
    return folderUsers?.find(user => user._id === userId).admin;
  }, [userId, folderUsers]);

  console.log(archived);

  return (
    <Form>

      <section>
        <label htmlFor="name">Name</label>
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
        <label  htmlFor="colour">Color</label>
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
        <label htmlFor="archived">Archived</label>
        <Input
          id="archived"
          name="archived"
          type="checkbox"
          value={archived}
          onChange={(e) =>  setArchived(!archived)}
          />
      </section>

      <section>
          <label htmlFor="users">Users</label>
          {
            users.map(user => <div key={user._id}>
              <img src={user.img} alt="avatar" width="100" height="100"/>
              {`${user.name} ${user.surname}`}
              {user.admin ? "Administrator" : "User"}
              {
                !user.admin &&
              <LinkButton onClick={(e) => {e.preventDefault(); setUsers(users.filter(u => u._id !== user._id))}}><Icon iconName="Delete"/></LinkButton>
            }
            </div>)
          }
      </section>

      <section>
        <Select
          styles={selectStyle}
          onChange={(e) => setUsers([...users, {...e}])}
          options={usersToSelect}
          />
      </section>

      <ButtonRow>
        <FullButton colour="grey" onClick={(e) => {e.preventDefault(); onCancel();}}>Cancel</FullButton>
        {onRemove && userIsAdmin &&
          <FullButton colour="red" onClick={(e) => {e.preventDefault(); onRemove(folderId); onCancel();}}>Delete</FullButton>
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
          Save
        </FullButton>
      </ButtonRow>

    </Form>
  );
};
