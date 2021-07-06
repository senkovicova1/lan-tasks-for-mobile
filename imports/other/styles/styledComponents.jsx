import styled from 'styled-components'

//colours
const backgroundColour = "#f6f6f6";
const phColour = "#004578";
const basicBlueColour = "#0078d4";
const lightBlueColour = "#deeaf3";

//numeric values
const contentOffset = "10%";
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
`;

export const PageHeader = styled.header `
    display: flex;
    justify-content: space-between;
    align-items: center;
  height: 50px;
  background-color: ${phColour};
  padding: 0px ${contentOffset};

  h1 {
    padding-left: 0.25em;
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
display: flex;
justify-content: flex-start;

button:first-child{
  margin-right: 1em;
}

button:last-child{
  margin-left: auto;
  margin-right: 0em;
}
`;

export const LinkButton = styled.button `
  color: ${(props) => props.font ? props.font : basicBlueColour};
  padding: 0px;
  height: 1em;
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
  color: white;
  padding: 0px;
  height: 1em;
  background-color: ${(props) => props.colour ? props.colour : "#0078d4" } !important;
  outline: none !important;
  border: none !important;
  line-height: 2em;
  height: 2em;
  display: flex;
  align-items: center;
  padding: 0px 0.5em;
  i {
    margin-right: 0.3em;
  }
`;

export const Sidebar = styled.nav `
padding-top: 1em;
 width: ${sidebarWidth};
 display: inline-block;
 vertical-align: top;
 line-height: 2em;

 hr{
   margin-block-start: 0.5em;
    margin-block-end: 0.5em;
 }
`;

export const SidebarLink = styled.li `
  padding-left: 0.4em;
  background-color: ${(props) => props.active ? lightBlueColour : "transparent"} !important;
  color: ${basicBlueColour} !important;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 2em;

  a, i, button {
    vertical-align: middle;
  }
`;

export const List = styled.section `
width: calc(100% - ${sidebarWidth});
padding: 1em 0em 0em 1em;
display: inline-block;
verticalAlign: top;

table {
  line-height: 2em;
  color: #333333;

  input {
    width: 100%;
  }

  tr{
    line-height: 2em;
  }

  th {
    font-weight: 600;
  }

  tbody>tr{
    font-size: 0.9em;
    background-color: white;
    border-bottom: 2px solid ${backgroundColour};
    td{
      padding-left: 0.4em;
    }
  }

  tbody>tr:first-child{
    display: none;
    background-color: transparent;
    border-bottom: 2px solid ${backgroundColour};
    td{
      padding: 0px !important;
      border-right: 2px solid ${backgroundColour};
    }
    td:last-child{
      border-right: 0px;
      input {
        padding-right: 0px;
      }
    }
  }
}
`;

export const SearchSection = styled.section `
display: flex;
justify-content: flex-start;
align-items: center;

margin: 1em 0em;

input, button {
  margin-right: 1em;
}
`;

export const Form = styled.form `
padding: 30px calc(40px - ${inputOffset});

hr{
  margin: 0em 0em 1em 0em;
}

.useOffset {
  margin-left: ${inputOffset};
  margin-right: ${inputOffset};
}

section {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  min-height: 3em;

  i {
    font-size: 1.5em;
  }

  label{
    margin: 0px;
    font-weight: 500;
    width: 200px;
  }
  input:not(#title)[type=text], input:not(#title)[type=color], input:not(#title)[type=password], &>div {
    width: 85%;
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

export const FormTable = styled.table `
  line-height: 2em;
  color: #333333;
  width: -webkit-fill-available;
  margin-bottom: 2em;

input[type=text], input[type=number], input[type=datetime-local]{
  width: 100%;
}

  td{
    line-height: 2em;
    height: 2em;
    align-tems: center;
  }

  th{
    font-weight: normal;
    font-size: 0.8em;
  }

  th:first-child {
    font-weight: 500;
    font-size: 1em;
  }

  thead>tr{
    border-bottom: 2px solid ${backgroundColour};
  }

  tbody>tr:not(:last-of-type){
    border-bottom: 1px solid ${backgroundColour};

    td:first-of-type{
      width: 2em;
    }
  }
  tr:not(:last-of-type)>td:last-of-type{
    display: flex;
    justify-content: flex-start;
    align-items: center;
    button:first-child{
      margin-left: auto;
    }

`;

export const Input = styled.input `
background-color: white !important;
outline: none !important;
border: 1px solid transparent;
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
margin: 10% auto auto auto;
background-color: white;
&>div {
   display: flex;
   justify-content: space-between;
}

`;
