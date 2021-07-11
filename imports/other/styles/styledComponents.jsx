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
  height: 50px;
  background-color: ${basicBlueColour};
  padding: 0px ${contentOffset};


    i {
      font-size: 1.5em;
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
  padding: 0px ${contentOffset};
`;


export const ButtonRow = styled.section `
margin-top: 0em !important;
button {
  margin-bottom: 0.5em;
}
}
`;

export const LinkButton = styled.button `
  color: ${(props) => props.font ? props.font : basicBlueColour};
  padding: 0px;
  height: 2em;
  background-color: transparent !important;
  outline: none !important;
  border: none !important;
  line-height: 1em;
  display: flex;
  align-items: center;
  i {
    margin-right: 0.3em;
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

export const List = styled.section `
width: 100%;
padding: 1em 0em 0em 0em;
display: inline-block;
verticalAlign: top;

&>div{
    display: flex;
}
`;

export const SearchSection = styled.section `
margin: 0em 0em 1em 0em;
input{
  border-left: none;
  width: 100%;
}
  width: 100%;
  display: flex;
  input:focus + i {
    border: 1px solid ${basicBlueColour} !important;
    border-right: none !important;
  }
  input:focus {
    border-left: none !important;
  }
  i {
    order: -1;
    background-color: white;
    border: 1px solid #d6d6d6;
    border-right: none !important;
    padding-left:5px;
  }
`;


export const ItemContainer = styled.section `
padding: 0em 1em;
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
padding: 0px;
width: -webkit-fill-available;

h1{
  font-size: 1.5em;
  font-weight: 400;
}

hr{
  margin: 0em 0em 1em 0em;
}

section {
  margin:  1.5em 0em;

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
      width: 30%;
      order: -1;
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
width: 500px;
height: calc(100vh - 50px);
margin: auto;
position: relative;

&>div{
    height: fit-content;
    width: inherit;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

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
