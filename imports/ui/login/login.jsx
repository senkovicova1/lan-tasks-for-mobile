import {
  Meteor
} from 'meteor/meteor';

import React, {
  useState
} from 'react';

import {
  Accounts
} from 'meteor/accounts-base';

import {
  Form,
  Input,
  FullButton,
  LinkButton
} from "../../other/styles/styledComponents";

export default function LoginForm( props ) {

  const { history, openSignUp } = props;

  const [ email, setEmail ] = useState( '' );
  const [ password, setPassword ] = useState( '' );

  const onSubmit = e => {
    e.preventDefault();
    Meteor.loginWithPassword( email, password );
    history.push("/all/list");
  };

  const handleForgotPassword = () => {
    Accounts.forgotPassword({email});
  } ;

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
      <FullButton type="submit" >Log In</FullButton>

      <LinkButton disabled={email.length === 0} onClick={(e) => {e.preventDefault(); handleForgotPassword()}}>Forgot password</LinkButton>
      <LinkButton onClick={(e) => {e.preventDefault(); openSignUp()}}>Account registration</LinkButton>


    </Form>
  );
};
