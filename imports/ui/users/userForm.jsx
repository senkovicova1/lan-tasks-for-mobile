import React, {
  useState,
  useEffect,
} from 'react';

import Select from 'react-select';

import {
  selectStyle
} from '../../other/styles/selectStyles';

import {
  isEmail
} from '../../other/helperFunctions.js';

import {
  LANGUAGES
} from '../../other/constants';

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
  const [ avatar, setAvatar ] = useState( {} );
  const [ language, setLanguage ] = useState( LANGUAGES[0] );
  const [ colour, setColour ] = useState( "#FFF" );
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
    if ( profile?.avatar ) {
      const blob = new Blob([profile.avatar], {type:"image/jpeg"} );
      const img = URL.createObjectURL(blob);
      setAvatar( {name: "", buffer: profile.avatar, img} );
    } else {
      setAvatar( {name: "", buffer: null, img: null} );
    }
    if ( profile?.colour ) {
      setColour( profile.colour );
    } else {
      setColour( "#FFF" );
    }
    if ( profile?.language ) {
      setLanguage( LANGUAGES.find(lang => lang.value === profile.language ) );
    } else {
      setLanguage( LANGUAGES[0] );
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
        <label  htmlFor="color">Color</label>
        <Input
          type="color"
          name="color"
          id="color"
          placeholder="Choose colour"
          value={colour}
          onChange={(e) => setColour(e.target.value)}
          />
      </section>

      <section>
        <label htmlFor="lang">Language</label>
        <Select
          styles={selectStyle}
          value={language}
          onChange={(e) => setLanguage(e)}
          options={LANGUAGES}
          />
      </section>

      <section>
        <label htmlFor="avatar">Profile picture</label>
        <Input
          id="avatar"
          name="avatar"
          type="file"
          value={avatar.name}
          onChange={(e) =>  {
            e.persist();
            var file = e.target.files[0];
            if (!file) return;

            var reader = new FileReader();

            reader.onload = function(event){
              var buffer = new Uint8Array(reader.result)

              const blob = new Blob([buffer], {type:"image/jpeg"} );
               const img = URL.createObjectURL(blob);

              setAvatar({name: e.target.value, buffer, img});
            }

            reader.readAsArrayBuffer(file);
          }}
          />
      </section>
<img src={avatar.img} alt="avatar" width="100" height="100"/>
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
          <FullButton colour="grey" onClick={(e) => {e.preventDefault(); onCancel()}}>Back</FullButton>
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
              avatar.buffer,
              colour,
              language.value,
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
