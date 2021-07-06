import React, {
  useState,
  useMemo,
  useEffect
} from 'react';
import {
  useTracker
} from 'meteor/react-meteor-data';

import AddUserContainer from './addUserContainer';
import EditUserContainer from './editUserContainer';

import {
  List,
  SearchSection,
  Input
} from "../../other/styles/styledComponents";

export default function UserList( props ) {
  const users = useTracker( () => Meteor.users.find( {} )
    .fetch() );

  const [ search, setSearch ] = useState( "" );
  const [ searchName, setSearchName ] = useState( "" );
  const [ searchSurname, setSearchSurname ] = useState( "" );
  const [ searchEmail, setSearchEmail ] = useState( "" );

  const [ chosenUser, setChosenUser ] = useState( null );

  const filteredUsers = useMemo( () =>
    users.filter( user =>
      user.profile.name.toLowerCase()
      .includes( search.toLowerCase() ) || user.profile.surname.toLowerCase()
      .includes( search.toLowerCase() )
    )
    .filter( user => user.profile.name.toLowerCase()
      .includes( searchName.toLowerCase() ) && user.profile.surname.toLowerCase()
      .includes( searchSurname.toLowerCase() )
    ), [ users, search ] );

  return (
    <List>
      <h2>Users</h2>
      <SearchSection>
        <Input width="30%" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        <AddUserContainer/>
      </SearchSection>
      <EditUserContainer user={chosenUser} setChosenUser={setChosenUser}/>
      <table>
        <thead>
          <tr>
            <th>Surname</th>
            <th>Name</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              <Input value={searchSurname} onChange={(e) => setSearchSurname(e.target.value)} />
            </th>
            <th>
              <Input value={searchName} onChange={(e) => setSearchName(e.target.value)} />
            </th>
            <th>
              <Input value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)} />
            </th>
          </tr>
          {filteredUsers.map(user =>
            <tr key={user._id} onClick={() => setChosenUser(user)}>
              <td>{user.profile.surname}</td>
              <td>{user.profile.name}</td>
              <td>{user.emails ? user.emails[0].address : "Cannot access email"}</td>
            </tr>
          )}
        </tbody>
      </table>
    </List>
  );
};
