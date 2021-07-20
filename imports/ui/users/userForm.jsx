import React, {
  useState,
  useEffect,
} from 'react';

import Select from 'react-select';

import {
  selectStyle
} from '../../other/styles/selectStyles';

import {
  isEmail,
  uint8ArrayToImg
} from '../../other/helperFunctions.js';

import {
  translations
} from '../../other/translations.jsx';

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
    openLogIn
  } = props;

  const [ name, setName ] = useState( "" );
  const [ surname, setSurname ] = useState( "" );
  const [ email, setEmail ] = useState( "" );
  const [ avatar, setAvatar ] = useState( {name: "", buffer: null, img: null} );
  const [ language, setLanguage ] = useState( LANGUAGES[0] );
  const [ colour, setColour ] = useState( "#FFFFFF" );
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
      const img = uint8ArrayToImg(profile.avatar);
      setAvatar( {name: "", buffer: profile.avatar, img} );
    } else {
      setAvatar( {name: "", buffer: null, img: null} );
    }
    if ( profile?.colour ) {
      setColour( profile.colour );
    } else {
      setColour( "#FFFFFF" );
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
        <h1>{translations[language.value].userProf}</h1>
      </section>

      <section>
        <label htmlFor="name">{translations[language.value].name}</label>
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
        <label htmlFor="surname">{translations[language.value].surname}</label>
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
            id="email"
            placeholder="Enter email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            />
        </section>
      }

      <section>
        <label  htmlFor="color">{translations[language.value].profColour}</label>
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
        <label htmlFor="language">{translations[language.value].language}</label>
        <Select
          id="language"
          name="language"
          styles={selectStyle}
          value={language}
          onChange={(e) => setLanguage(e)}
          options={LANGUAGES}
          />
      </section>

      <section>
        <label htmlFor="avatar">{translations[language.value].avatar}</label>
        <div>
          {
            avatar.img &&
            <img src={avatar.img} alt="avatar" width="50" height="50"/>
          }
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
                var buffer = new Uint8Array(reader.result);
                const img = uint8ArrayToImg(buffer);
                setAvatar({name: e.target.value, buffer, img});
              }
              reader.readAsArrayBuffer(file);
            }}
            />
        </div>
      </section>


      { !profile &&
        <section>
          <label htmlFor="password1">{translations[language.value].pass}</label>
          <Input
            type="password"
            placeholder="Password"
            id="password1"
            name="password1"
            type="password"
            value={password1}
            required
            onChange={e => setPassword1(e.target.value)}
            />
        </section>
      }
      { !profile &&
        <section>
          <label htmlFor="password2">{translations[language.value].repPass}</label>
          <Input
            type="password"
            placeholder="Repeat password"
            id="password2"
            name="password2"
            type="password"
            value={password2}
            required
            onChange={e => setPassword2(e.target.value)}
            />
        </section>
      }

      <ButtonRow>
        {onCancel &&
          <FullButton colour="grey" onClick={(e) => {e.preventDefault(); onCancel()}}>{translations[language.value].back}</FullButton>
        }
        {openLogIn &&
          <FullButton colour="grey" onClick={(e) => {e.preventDefault(); openLogIn()}}>{translations[language.value].cancel}</FullButton>
        }
        {onRemove &&
          <FullButton colour="red" onClick={(e) => {e.preventDefault(); onRemove(userId); onCancel();}}>{translations[language.value].delete}</FullButton>
        }
        <FullButton
          colour=""
          disabled={name.length + surname.length + email.length === 0 || (!profile && !isEmail(email)) || (!profile && password1 !== password2) || !avatar.buffer || (!profile && password1.length < 7)}
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
          { isSignIn ? translations[language.value].sign : translations[language.value].save}
        </FullButton>
      </ButtonRow>

    </Form>
  );
};
