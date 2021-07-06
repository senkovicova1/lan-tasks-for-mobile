import React, {
  useState,
  useEffect,
} from 'react';

import {
  isEmail
} from '../../other/helperFunctions.js';

import {
  Form,
  Input,
  ButtonRow,
  FullButton,
} from "../../other/styles/styledComponents";

export default function UserForm( props ) {

  const {
    _id: userId,
    profile,
    onSubmit,
    onRemove,
    onCancel,
    isSignIn,
  } = props;

  const [ name, setName ] = useState( "" );
  const [ surname, setSurname ] = useState( "" );
  const [ email, setEmail ] = useState( "" );
  const [ showMyTasks, setShowMyTasks ] = useState( false );
  const [ password1, setPassword1 ] = useState( '' );
  const [ password2, setPassword2 ] = useState( '' );

  useEffect( () => {
    if ( profile?.name ) {
      setName( profile.name );
    } else {
      setName( "" );
    }
    if ( profile?.surname ) {
      setSurname( profile.surname );
    } else {
      setSurname( "" );
    }
    if ( profile?.showMyTasks ) {
      setShowMyTasks( profile.showMyTasks );
    } else {
      setShowMyTasks( false );
    }
  }, [ profile ] );

  return (
    <Form>

      <section>
        <label htmlFor="name">Name</label>
        <Input
          id="name"
          name="name"
          placeholder="Enter name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          />
      </section>

      <section>
        <label htmlFor="surname">Surname</label>
        <Input
          id="surname"
          name="surname"
          placeholder="Enter surname"
          type="text"
          value={surname}
          onChange={(e) =>  setSurname(e.target.value)}
          />
      </section>

      { !profile &&
        <section>
          <label  htmlFor="email">Email</label>
          <Input
            name="email"
            placeholder="Enter email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            />
        </section>
      }

      <section>
        <Input
          id="showMyTasks"
          type="checkbox"
          name="showMyTasks"
          checked={showMyTasks}
          onChange={() =>  setShowMyTasks(!showMyTasks)}
          />
        <label style={{width: "99%"}} htmlFor="showMyTasks">Show only my tasks by default</label>
      </section>

      { !profile &&
        <section>
          <label htmlFor="password1">Password</label>
          <Input
            type="password"
            placeholder="Password"
            name="password1"
            type="password"
            required
            onChange={e => setPassword1(e.target.value)}
            />
        </section>
      }
      { !profile &&
        <section>
          <label htmlFor="password2">Repeat password</label>
          <Input
            type="password"
            placeholder="Repeat password"
            name="password2"
            type="password"
            required
            onChange={e => setPassword2(e.target.value)}
            />
        </section>
      }

      <ButtonRow>
        {onCancel &&
          <FullButton colour="grey" onClick={(e) => {e.preventDefault(); onCancel()}}>Cancel</FullButton>
        }
        {onRemove &&
          <FullButton colour="red" onClick={(e) => {e.preventDefault(); onRemove(userId); onCancel();}}>Delete</FullButton>
        }
        <FullButton
          colour=""
          disabled={name.length + surname.length + email.length === 0 || (!profile && !isEmail(email)) || (!profile && password1 !== password2)}
          onClick={(e) => {
            e.preventDefault();
            onSubmit(
              name,
              surname,
              showMyTasks,
              email,
              password1
            );
          }}
          >
          { isSignIn ? "Sign in" : "Save"}
        </FullButton>
      </ButtonRow>

    </Form>
  );
};
