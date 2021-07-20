import styled from 'styled-components'

//colours
const backgroundColour = "#f6f6f6";
const phColour = "#004578";
const basicBlueColour = "#0078d4";
const lightBlueColour = "#deeaf3";

//numeric values
const contentOffset = "calc((100vw - 800px)/2)";
const sidebarWidth = "20%";
const inputOffset = "7px";

export const MainPage = styled.div `
  font-size: 1em;
  text-align: left;
  line-height: 1.5em;

  h1, h2, h3, h4 {
    font-weight: lighter;
  }

  h2 {
    font-size: 2em;
  }

  ul {
    list-style-type: none;
    padding: 0px;
  }
  label {
    margin: 0px;
  }

  hr{
    color: #d6d6d6;
    margin: 0px;
    opacity: 1;
  }
`;

export const PageHeader = styled.header `
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  height: 50px;
  background-color: ${basicBlueColour};
  @media all and (max-width: 799px) {
    padding: 0px ${inputOffset};
  }
  @media all and (min-width: 800px){
    padding: 0px calc(${contentOffset} + ${inputOffset});
  }


    i {
      font-size: 1.5em;
    }

    button{
      i{
        margin: 0px !important;
      }
      margin-right: 1em;
    }

    button:last-of-type{
        margin: 0px !important;
    }

  h1 {
    padding-left: 0em;
    display: inline;
    font-size: 1.5em;
    color: white;
  }
`;

export const Content = styled.main `
  display: block;
  @media all and (max-width: 799px) {
    padding: 0px;
  }
  @media all and (min-width: 800px){
    padding: 0px calc(${contentOffset} + ${inputOffset});
  }
  height: calc(100vh - 50px);
`;


export const ButtonRow = styled.section `
margin-top: 0em !important;
button {
  margin-bottom: 0.5em;
}
}
`;

export const Sidebar = styled.section `
  background-color: ${backgroundColour};
  position: absolute;
  @media all and (max-width: 799px) {
    left: 0;
    box-shadow: 5px 0px 13px 0px slategrey;
  }
  @media all and (min-width: 800px){
    left: calc(${contentOffset} - 300px + ${inputOffset});
    box-shadow: 0px 0px 3px 0px slategrey;
  }
  top: 50px;
  height: calc(100vh - 50px);
  z-index: 3;
  width: 300px;
  padding: ${inputOffset};

  a {
    display: block;
    padding: 0.5em 0px;
    text-decoration: none;
  }

  a.active {
    text-decoration: underline;
  }

`;

export const LinkButton = styled.button `
  color: ${(props) => props.font ? props.font : basicBlueColour};
  padding: 0px;
  height: ${(props) => props.searchButton ? "26px" : "2em" };
  background-color: ${(props) => props.searchButton ? "white" : "transparent" } !important;
  outline: none !important;
  border: none !important;
  line-height: 1em;
  display: flex;
  align-items: center;
  i {
    margin-right: ${(props) => props.searchButton ? "0px" : "0.3em" };
  }
`;

export const FullButton = styled.button `
  width: 100%;
  color: white;
  padding: 0px;
  background-color: ${(props) => props.colour ? props.colour : "#0078d4" } !important;
  outline: none !important;
  border: none !important;
  line-height: 2em;
  height: 2em;
  align-items: center;
  padding: 0px 0.5em;
  i {
    margin-right: 0.3em;
  }
`;

export const FloatingButton = styled.button `
  color: white;
  padding: 0px 0.8em;
  height: 2.5em;
  background-color: ${(props) => props.font ? props.font : basicBlueColour};
  outline: none !important;
  border: none !important;
  border-radius: 1.5em;
  align-items: center;
  position: absolute;
  bottom: 1em;
  right: 1em;
  span{
    vertical-align: text-bottom;
  }
`;

export const List = styled.section `
width: 100%;
padding: 0em 0em 0em 0em;
display: inline-block;
verticalAlign: top;

&>div{
    display: flex;
}

&>section.showClosed{
  margin-top: 1em;
  display: block;
  height: 32px;
}

&>section.showClosed, button{
  margin-left: ${inputOffset};
}

span.message{
  margin: 0em ${inputOffset};
  line-height: 2em;
}
`;

export const SearchSection = styled.section `
width: -webkit-fill-available;
input{
  width: -webkit-fill-available;
  border: none !important;
  outline: none !important;
}
input:focus{
  border: none !important;
}
`;


export const ItemContainer = styled.section `

&:hover{
  cursor: pointer;
}
padding: 0em ${inputOffset};
height: 3em;
display: flex;
color: ${basicBlueColour};
&> input, &> span, &> button{
  height: 3em !important;
}
&> span {
  padding: 10px;
}
&> button{
  margin-left: auto;
}
`;

export const Form = styled.form `
padding: 1em ${inputOffset};
width: -webkit-fill-available;

h1{
  font-size: 1.5em;
  font-weight: 400;
}

hr{
  margin: 0em 0em 1em 0em;
}

section {
  margin: 0em 0em 1.5em 0em;

  i {
    font-size: 1.5em;
  }

  img {
    width:32px;
    height: 32px;
    border-radius: 50px;
    margin-right: 1em;
  }

  label{
    margin: 0px 1em 0em 0em;
    font-weight: 500;
  }
  input[type=text], input[type=color], input[type=password],  &>div {
    width: 100%;
  }
  input[type=color]{
      border: none;
      background-color: transparent !important;
      padding: 0px;
    }

  input[type=file]{
    width: calc(100% - 5em);
    border: none;
    background-color: transparent !important;
  }

  input[type=checkbox] + label{
      vertical-align: middle;
    }

input[type=checkbox]{
    margin-right: 5px;
  }

}
`;

export const Input = styled.input `
background-color: white !important;
outline: none !important;
border: 1px solid #d6d6d6;
width: ${(props) => props.width ? props.width : "auto"};
padding-left: 0.4em;

&:focus{
  border: 1px solid ${basicBlueColour} !important;
}

&[type=checkbox]{
    height: 1.3em;
    width: 1.3em;
    vertical-align: middle;
}
`;

export const Textarea = styled.textarea `
background-color: white !important;
outline: none !important;
border: 1px solid transparent;
width: ${(props) => props.width ? props.width : "auto"};
padding-left: 0.4em;

&:focus{
  border: 1px solid ${basicBlueColour} !important;
}
`;

export const TitleInput = styled( Input )
`
background-color: transparent !important;
outline: none !important;
border: none !important;
width: ${(props) => props.width ? props.width : "-webkit-fill-available"};
height: 2em;
font-size: 2em;
font-weight: lighter;
padding-left: 0em;
`;

export const GroupButton = styled.button `
  width: -webkit-fill-available;

  background-color: ${(props) => props.colour ? props.colour : "white"};
  color: ${(props) => props.colour ? "white" : basicBlueColour};
  outline: none !important;
  border: 1px solid ${basicBlueColour};

  border-radius: 0px;

  &:last-of-type{
    border-left: 0px;
  }
`;

export const LoginContainer = styled.div`
@media all and (max-width: 799px) {
  width: auto;
}
@media all and (min-width: 800px){
  width: 500px;
}

height: calc(100vh - 50px);
margin: auto;

&>div{
    height: -webkit-fill-available;
    width: inherit;
    background-color: ${backgroundColour};
    position: relative;
    display: flex;
    align-items: center;
}

h1 {
  margin: 0px;
  background-color: ${basicBlueColour};
  color: white;
  font-size: 1.5em;
  font-weight: 400;
  padding-left: 5px;
  height: 1.5em;
}
`;

export const UserEntry = styled.div`
display: flex;
margin-bottom: 0.5em;
div {
  display: inline-block;
}
label.name {
display: block;
font-weight: 400;
}

label.role {
display: block;
font-weight: 400;
color: ${basicBlueColour};
font-size: 0.9em;
}

button{
  margin-left: auto;
}
`;
