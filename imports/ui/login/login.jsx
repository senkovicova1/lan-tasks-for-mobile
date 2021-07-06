import {
  Meteor
} from 'meteor/meteor';

import React, {
  useState
} from 'react';

import {
  Form,
  Input,
  FullButton
} from "../../other/styles/styledComponents";

export default function LoginForm( props ) {

  const { history } = props;

  const [ email, setEmail ] = useState( '' );
  const [ password, setPassword ] = useState( '' );

  const onSubmit = e => {
    e.preventDefault();
    history.push("tasks/all/all");
    Meteor.loginWithPassword( email, password );
  };

  return (
    <Form onSubmit={onSubmit}>

      <section>
        <label htmlFor="email">Email</label>
        <Input
          type="text"
          placeholder="Email"
          name="email"
          id="email"
          required
          onChange={e => setEmail(e.target.value)}
          />
      </section>

      <section>
        <label htmlFor="password">Password</label>
        <Input
          type="password"
          placeholder="Password"
          name="password"
          id="password"
          required
          onChange={e => setPassword(e.target.value)}
          />
      </section>

      <FullButton type="submit" style={{marginLeft: "auto"}}>Log In</FullButton>

    </Form>
  );
};
