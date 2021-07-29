import styled from 'styled-components'

//colours
const backgroundColour = "#f6f6f6";
const phColour = "#004578";
const basicBlueColour = "#0078d4";
const lightBlueColour = "#deeaf3";

//numeric values
const contentOffset = "calc((100vw - 800px)/2)";
const sidebarWidthWeb = "250px";
const sidebarWidthMobile = "300px";
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


  img.icon {
    height: 1.3em;
    filter: invert(32%) sepia(81%) saturate(4601%) hue-rotate(210deg) brightness(90%) contrast(101%);
  }
`;

export const PageHeader = styled.header `
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  height: 50px;
  background-color: ${basicBlueColour};

  @media all and (max-width: 799px), @media handheld  {
    padding: 0px ${inputOffset};
  }
  @media all and (min-width: 800px){
    ${(props) =>
      props.widthWithSidebar &&
      `
      padding: 0px calc(${contentOffset} - ${sidebarWidthWeb} / 2 );
      `
    };
    ${(props) =>
      !props.widthWithSidebar &&
      `
      padding: 0px calc(${contentOffset} + ${inputOffset});
      `
    };
  }

    i {
      font-size: 1.5em;
    }

    img.icon {
      filter: invert(1);
        height: 1.5em;
        width: 1.5em;
    }

    img.search-icon{
      height: 1.3em;
      width: 1.3em;
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
    height: 32px;
    padding-left: 0em;
    display: inline;
    font-size: 1.5em;
    color: white;
    margin-bottom: 0em;
  }
`;

export const Content = styled.main `
  display: block;
  @media all and (max-width: 799px), @media handheld {
    width: 100%;
  }
  @media all and (min-width: 800px){
    ${(props) =>
      props.widthWithSidebar &&
      `
      margin-left: calc(${contentOffset} + ${sidebarWidthWeb} / 2);
      margin-right: calc(${contentOffset} - ${sidebarWidthWeb} / 2);
      `
    };
    ${(props) =>
      !props.widthWithSidebar &&
      `
      margin-left: ${contentOffset};
      margin-right: ${contentOffset};
      `
    };
  }
  height: calc(100vh - 50px);
`;


export const ButtonRow = styled.section `
display: flex;
margin-top: 0em !important;
margin-bottom: 0em;
button:first-of-type{
  margin-right: 0.5em;
}
button:last-of-type{
  margin-left: 0.5em;
}
}
`;

export const ButtonCol = styled.section `
margin-top: 0em !important;
button:not(last-of-type) {
  margin-bottom: 1.5em;
}
}
`;

export const Sidebar = styled.section `
  background-color: ${backgroundColour};
  position: absolute;
  @media all and (max-width: 799px), @media handheld  {
    left: 0;
    box-shadow: 5px 0px 13px 0px slategrey;
    width: ${sidebarWidthMobile};
  }
  @media all and (min-width: 800px){
    left: calc(${contentOffset} - ${sidebarWidthWeb} / 2 - ${inputOffset});
    box-shadow: none;
    border-right: 0px solid #d6d6d6;
    width: ${sidebarWidthWeb};
  }
  top: 50px;
  height: calc(100vh - 50px);
  z-index: 3;
  padding: 0px;

  a {
    color: ${basicBlueColour} !important;
    display: flex;
    height: 3em;
    padding: 10px ${inputOffset};
    text-decoration: none !important;
    i, img.icon{
      margin-right: 10px;
    }
    img.icon{
      filter: invert(32%) sepia(81%) saturate(4601%) hue-rotate(210deg) brightness(80%) contrast(101%);
    }
  }

  a.active {
    background-color: ${basicBlueColour}22;
  }
`;

export const LinkButton = styled.button `
  color: ${(props) => props.font ? props.font : basicBlueColour};
  padding: 0px;
  height: 2.5em;
  background-color: ${(props) => props.searchButton ? "white" : "transparent" } !important;
  outline: none !important;
  border: none !important;
  line-height: 1em;
  display: flex;
  align-items: center;
  i, img {
    margin-right: ${(props) => props.searchButton ? "0.6em" : "0.3em" }
  }
  img {
    ${(props) => props.searchButton && `
      filter: invert(32%) sepia(81%) saturate(4601%) hue-rotate(191deg) brightness(97%) contrast(101%) !important;
      `};
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
  i, img.icon {
    margin-right: 0.3em;
  }
  img.icon{
    filter: invert(1) !important;
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
  right: ${inputOffset};
  display: flex;

  span{
    vertical-align: text-bottom;
    margin-left: 0.3em;
  }
  img.icon{
    filter: invert(1) !important;
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
  display: block;
  height: 3em;
  input{
    width: 1.5em !important;
  }
  label{
    padding: 10px;
  }
}

  button.item{
    i {
      width: 1.5em;
      margin-right: 10px;
    }
    height: 3em;
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
align-items: center;
color: ${basicBlueColour};

input[type=checkbox]{
  width: 1.5em !important;
  height: 1.5em !important;
}

&> span {
  margin-right: auto;
  padding: 10px;
  width: calc(100% - 6em);
  overflow-wrap: anywhere;
}

img.icon{
  height: 1.3em;
  filter: invert(32%) sepia(81%) saturate(4601%) hue-rotate(210deg) brightness(90%) contrast(101%);
}

img.avatar {
  width:32px;
  height: 32px;
  border-radius: 50px;
  margin-right: 0.6em;
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
  section:last-of-type {
    margin: 0em !important;
  }
}
`;

export const Input = styled.input `
background-color: white !important;
outline: none !important;
border: 1px solid #d6d6d6;
width: ${(props) => props.width ? props.width : "auto"};
padding-left: 0.4em;
height: 2.5em !important;

&:focus{
  border: 1px solid ${basicBlueColour} !important;
}

&[type=checkbox]{
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
@media all and (max-width: 799px), @media handheld  {
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

export const LoadingScreen = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  background-color: ${backgroundColour}AA;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  div{
    margin-left: auto;
    margin-right: auto;
    span.sr-only{
      display: none;
    }
  }
`;
