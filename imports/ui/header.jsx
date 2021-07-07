import React from 'react';
import {
  Link
} from 'react-router-dom';

import {
  Icon
} from '@fluentui/react/lib/Icon';

import {
  PageHeader,
  LinkButton
} from '../other/styles/styledComponents';

export default function Header( props ) {
  const logout = () => Meteor.logout();

  return (
    <PageHeader>
      <h1 onClick={(e) => props.history.push("/tasks/all")}>TaskApp</h1>
        {!props.location.pathname.includes("login") &&
          <LinkButton font="white" onClick={(e) => {e.preventDefault(); props.history.push("/settings"); }}><Icon  iconName="Settings" /></LinkButton>
        }
      {!props.location.pathname.includes("login") &&
        <LinkButton  font="white" onClick={(e) => {e.preventDefault(); props.history.push("/login"); logout();}}><Icon  iconName="SignOut" /></LinkButton>
      }
    </PageHeader>
  );
};
