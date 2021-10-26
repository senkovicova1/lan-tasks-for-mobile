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
const inputOffset = "15px";

export const MainPage = styled.div `
  font-size: 1em;
  text-align: left;
  line-height: 1.5em;
  overflow: hidden !important;

  h1, h2, h3, h4 {
    font-weight: lighter;
  }

  h2 {
    font-size: 2em;
  }

  label {
    margin: 0px;
  }

  hr{
    color: #d6d6d6;
    margin: 0px;
    opacity: 1;
  }

  .label-icon{
    width: 2em;
    height: 1.3em;
  }
   .search-icon{
      height: 1em !important;
      width: 1em !important;
    }

    .flip{
      transform: scaleX(-1);
    }
`;

export const MobilePageHeader = styled.header `
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  height: 50px;
  background-color: ${basicBlueColour};
  padding: 0px ${inputOffset};

  img.icon {
    filter: invert(1) !important;
    margin-right: 0px;
  }

  button{
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

  div.search-section{
    width: -webkit-fill-available;
    input{
      width: -webkit-fill-available;
      border: none !important;
      outline: none !important;
    }
  }
`;

export const PageHeader = styled.header `
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 50px;
  background-color: ${basicBlueColour};
  padding: 0px ${inputOffset};

  section.header-section{
    width: 350px;
    align-items: center;
    display: flex;

   overflow: hidden;
   text-overflow: ellipsis;
   white-space: nowrap;
  }

  section.header-section button{
    margin-right: 1em;
    @media all and (max-width: 799px), @media handheld {
      margin-right: 0.3em;
    }
  }

  button:not(.left):last-of-type{
    margin: 0px !important;
  }

 section.header-section img.icon {
    filter: invert(1);
    margin-right: 0px;
  }

  h1 {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    height: 32px;
    padding-left: 0em;
    display: inline;
    font-size: 1.5em;
    color: white;
    margin-bottom: 0em;
    margin-left: 1em;
  }

  div.search-section{
    width: -webkit-fill-available;
  }

  div.search-section  input{
    width: -webkit-fill-available;
    border: none !important;
    outline: none !important;
  }

  div.search-section input:focus{
    border: none !important;
  }
`;

export const SearchSection = styled.section `
  display: flex;
  width: 800px !important;

  input{
    width: -webkit-fill-available;
    border: none !important;
    outline: none !important;
  }

  input:focus{
    border: none !important;
  }

  img.search-icon{
    height: 1em;
    width: 1em;
  }

  button:last-of-type {
    margin-left: 0em !important;
    padding-left: 7px;
  }

  button:first-of-type {
    margin-right: 0em;
    padding-left: 0.6em;
  }
`;

export const Content = styled.main `
  display: block;
  overflow-y: auto;
  overflow-x: hidden;
  height: calc(100vh - 50px);

  @media all and (max-width: 799px), @media handheld {
    width: 100%;
  }

  @media all and (min-width: 800px){
    padding-left: ${(props) => props.withSidebar ? `${sidebarWidthWeb}` : "30px"};
    padding-right: 0px;
  }
`;


export const InnerContent = styled.main `
  display: block;

  @media all and (max-width: 799px), @media handheld {
    width: 100%;
  }

  @media all and (min-width: 800px) {
    padding-left: ${(props) => props.withSidebar ? `calc(50vw - ${sidebarWidthWeb} - 400px)` : "0px"};
    padding-right: ${(props) => props.withSidebar ? `calc(50vw - 400px)` : "0px"};
  }
`;

export const CalendarContainer = styled.div`
  padding: 30px;
  height: -webkit-fill-available;

  .task-list{
    width: 20%;
    padding-right: 30px;
  }
`;

export const DndContainer = styled.div`
  padding: 30px;
  height: -webkit-fill-available;
  overflow-x: auto;

  ul{
    width: 400px;
    padding: 0em 2em 0em 0em;
  }

  .thin-placeholder{
    height: fit-content !important;
    ::placeholder{
      color: black;
    }
  }

  .new-container-form{
      display: flex;
      width: 400px;
  }
  .new-container-form input{
    margin: 0px;
  }
.new-container-form input:focus, input.truly-invisible:focus{
  background-color: transparent !important;
}

  .new-container-form img {
    width: 1.5em;
    height: 1.5em;
  }
`;

export const ButtonRow = styled.section `
  display: flex;
  margin-top: 0em !important;
  margin-bottom: 0em;

  button{
    width: fit-content;
    height: auto;
  }

  button:first-of-type{
    margin-right: 0.5em;
    margin-left: auto;
  }

  button:last-of-type{
    margin-left: 0.5em;
  }
`;

export const ButtonCol = styled.section `
  button{
    margin: 0em 0em 1.5em 0em;
  }

  button:last-of-type{
    margin-bottom: 0em;
  }
`;

export const Sidebar = styled.section `
  background-color: ${backgroundColour};
  position: absolute;
  overflow: hidden;
  left: 0;

  @media all and (max-width: 799px), @media handheld  {
    box-shadow: 5px 0px 13px 0px slategrey;
    width: ${sidebarWidthMobile};
  }

  @media all and (min-width: 800px){
    box-shadow: none;
    border-right: 0px solid #d6d6d6;
    width: ${sidebarWidthWeb};
    background-color: white;
  }

  top: 50px;
  height: calc(100vh - 50px);
  z-index: 3;
  padding: 0px;

  a {
    color: ${basicBlueColour} !important;
    display: flex;
    align-items: center;
    height: 3em;
    padding: 10px ${inputOffset};
    text-decoration: none !important;
  }

  a .icon{
    margin-right: 10px;
  }

  a.active {
    background-color: ${basicBlueColour}22;
  }
`;

export const LinkButton = styled.button `
  color: ${(props) => props.font ? props.font : basicBlueColour};
  padding: 0px;
  height: ${(props) => props.height === "fit" ? "fit-content" : "2.5em"};
  background-color: ${(props) => props.searchButton ? "white" : "transparent" } !important;
  outline: none !important;
  border: none;
  line-height: 1em;
  display: flex;
  align-items: center;
  i, img {
    margin-right: 0.6em;
  }
   img.icon {
    filter: invert(32%) sepia(81%) saturate(4601%) hue-rotate(210deg) brightness(90%) contrast(101%);

    ${(props) => props.searchButton && `
      filter: invert(32%) sepia(81%) saturate(4601%) hue-rotate(191deg) brightness(97%) contrast(101%) !important;
      `};
  }
  span{
    width: max-content;
  }
`;

export const CircledButton = styled.button `
  color: ${(props) => props.font ? props.font : basicBlueColour};
  border: 1px solid #0078d4;
  border-radius: 2em;
  margin-left: ${(props) => props.left ? "auto" : ""};

  width: 2em;
  height: 2em;
  background-color: transparent !important;
  outline: none !important;

  display: flex;
  align-items: center;

 .icon {
    filter: invert(32%) sepia(81%) saturate(4601%) hue-rotate(210deg) brightness(90%) contrast(101%);

    margin: 0px;
    margin-left: auto;
    margin-right: auto;
  }
`;

export const FullButton = styled.button `
  width: ${(props) => props.width ? props.width : "100%" };
  color: white;
  padding: 0px;
  background-color: ${(props) => props.colour ? props.colour : "#0078d4" } !important;
  margin-left: ${(props) => props.right ? "auto" : "0px" };
  margin-right: ${(props) => props.left ? "auto" : "0px" };
  outline: none !important;
  border: none !important;
  line-height: 2em;
  height: 2em;
  align-items: center;
  padding: 0px 0.5em;

  .icon{
    margin-right: 0.3em;
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
  bottom: 40px;
  display: flex;

  ${(props) => props.left &&
    `
    left: ${inputOffset};
    `
  }

  ${(props) => !props.left &&
    `
    right: ${inputOffset};
    `
  }

  span{
    vertical-align: text-bottom;
    margin-left: 0.3em;
  }

  .icon{
    filter: invert(1) !important;
  }
`;

export const List = styled.section `
  width: 100%;
  height: calc(100vh - 60px);
  padding: 0em 0em 0em 0em;
  display: inline-block;
  verticalAlign: top;

  &>div{
      display: flex;
  }

  button.item{
    height: 3em;
  }

  span.message, div.sort{
    margin: 0em ${inputOffset};
    line-height: 3em;
    display: block;
  }

  div.sort>label, div.sort>.sort-by{
    margin-right: 0.6em;
  }

  div.sort>select{
    border: 1px solid ${basicBlueColour} !important;
    outline: none !important;
  }
`;

export const ItemContainer = styled.section `
  &:hover{
    cursor: pointer;
  }

  padding: 0em ${inputOffset};
  min-height: 3em;
  display: flex;
  align-items: center;
  color: ${basicBlueColour};

  input[type=checkbox]{
    width: 1.5em !important;
    height: 1.5em !important;
    margin-right: 0.6em;
  }

  &> span:not(.colour) {
    margin-right: auto;
    padding: 10px;
    overflow-wrap: anywhere;
  }

  &> span:not(.colour) {
    width: calc(100% - 6em);
  }

  .icon:not(.star){
    filter: invert(32%) sepia(81%) saturate(4601%) hue-rotate(210deg) brightness(90%) contrast(101%);
  }

  .usericon{
    width: 32px;
    height: 32px;
    border-radius: 50px;
    margin-right: 0.6em;
    filter: invert(32%) sepia(81%) saturate(4601%) hue-rotate(210deg) brightness(90%) contrast(101%);
  }

  &>span.colour{
    margin-left: auto;
    width: 2em;
    height: 2em;
  }
`;

export const ItemCard = styled.section`
  background-color: white;
  margin-bottom: 1em;
  box-shadow: 0px 1px 10px slategrey;
  padding: 0.6em;

  &:hover{
    cursor: pointer;
  }

  .info-bar{
    display: flex;
    align-items: center;
    width: 100%;
  }

  .star, input[type=checkbox]{
    margin-right: 0.6em;
  }

    input[type=checkbox]{
      width: 1.5em !important;
      height: 1.5em !important;
    }

    &> span:not(.colour) {
      margin-right: auto;
      padding: 10px;
      overflow-wrap: anywhere;
      width: calc(100% - 6em);
    }

    button{
      margin-left: auto;
    }

    .usericon{
      width: 32px;
      height: 32px;
      border-radius: 50px;
      margin-right: 0.6em;
      filter: invert(32%) sepia(81%) saturate(4601%) hue-rotate(210deg) brightness(90%) contrast(101%);
    }
`;

export const Form = styled.form `
  padding: 1em;
  width: -webkit-fill-available;

  .full-width{
    width: -webkit-fill-available;
  }

   .m-r-03{
     margin-right: 0.3em;
   }

  section{
    margin: 0em 0em 1.5em 0em;
    padding: ${(props) => props.excludeBtn ? "0em 0.7em" : "0px"};
  }

  section.fit{
    height: fit-content;
  }

  section.inline{
    display: flex;
    align-items: center;
  }

  section:last-of-type {
    margin: 0em !important;
  }

  h1, h2{
    font-size: 1.5em;
    font-weight: 400;
  }

     h3{
      font-size: 1.5em;
      font-weight: 200;
    }

  hr{
    margin: 0em 0em 1em 0em;
  }

  label{
    margin: 0px 1em 0em 0em;
    font-weight: 500;
  }

  .icon-container{
    height: 40px;
    display: flex;
    align-items: center;
    margin-right: 0.6em;
  }

  .label-icon{
    width: 2em;
    height: 1.3em;
  }

  .datetime-span{
    display: flex;
    width: 100%;
    background: white;
    padding: 0px 7px;
    align-items: center;
    cursor: pointer;
  }

  .datetime-span span {
    width: -webkit-fill-available;
    height: 40px;
    display: flex;
    align-items: center;
  }

  input[type=text], input[type=color], input[type=password], input[type=number], input[type=datetime-local], &>div:not(.spinner), textarea {
    width: 100%;
  }

  input[type=color]{
    padding: 0px;
  }

  input[type=checkbox] + label{
    vertical-align: middle;
  }

  input[type=checkbox]{
    margin-right: 5px;
    width: 1em;
    height: 1em;
  }

  input[type=file]{
    border: none;
    color: #f6f6f6;
    background-color: transparent !important;
    padding: 0px;
    width: 100px;

    /* IE UPLOAD BUTTON STYLE: This attempts to alter the file upload button style in IE.  Keep in mind IE gives you limited design control but at least you can customize its upload button.*/
    ::-ms-browse { /* IE */
      display: inline-block;
      vertical-align: -webkit-baseline-middle;
      margin: 0;
      padding: .2em .5em;
      padding: .2rem .5rem;
      text-align: center;
      outline: none;
      border: none;
      background: #fff;
      white-space: nowrap;
      cursor: pointer;
    }
    /* FIREFOX UPLOAD BUTTON STYLE */
    ::file-selector-button {/* firefox */
      display: inline-block;
      vertical-align: -webkit-baseline-middle;
      margin: 0rem 1rem 0rem 0rem;
      padding: .18em .5em;
      padding: .18rem .5rem;
      -webkit-appearance: button;
      text-align: center;
      border-radius: .1rem 0rem 0rem .1rem;
      outline: none;
      border: none;
      border-right: 2px solid #bbb;
      background: #eee;
      white-space: nowrap;
      cursor: pointer;
    }
    /* CHROME AND EDGE UPLOAD BUTTON STYLE */
    ::-webkit-file-upload-button { /* chrome and edge */
      display: inline-block;
      vertical-align: -webkit-baseline-middle;
      margin: 0em;
      -webkit-appearance: button;
      text-align: center;
      border-radius: 0em;
      outline: none;
      border: none;
      color: ${basicBlueColour};
      background: ${lightBlueColour};
      margin-right: 0.3em;
      white-space: nowrap;
      cursor: pointer;
    }
  }

  input:disabled{
    background-color: transparent !important;
  }

  .color-picker label{
      display: block;
  }

  .color-picker .colours{
      display: flex;
      margin-bottom: 0.6em;
      justify-content: space-between;
      align-items: center;
    }

  .files{
    display: inline;
  }

  .spinner{
    height: 1em;
    width: 1em;
  }

  .pipe{
    display: flex;
    align-items: center;
  }

  .pipe button:first-of-type{
    margin-right: 0.6em;
  }

  .pipe button:last-of-type{
    margin-left: 0.6em;
  }

  .pipe button{
    color: grey;
  }

  .pipe button.active{
    color: black;
    font-weight: 500;
  }

  .history{
    background: white;
    padding: 0.6em;
  }

  .history p:first-of-type{
    color: ${basicBlueColour};
  }

  .history p:last-of-type{
    margin: 0px;
  }
`;

export const Color = styled.div`
  height:  calc(2.5em + 10px);
  width: 18%;
  margin: 0.05em;

  border: 5px solid ${(props) => props.active ? basicBlueColour : "white"};

  &:last-of-type {
   margin-left: 0.05em;
   margin-right: 0em;
  }

  &:first-of-type {
  margin-right: 0.05em;
  margin-left: 0em;
  }

  &:hover{
    border: ${(props) => props.active ? "5px" : "0px"} solid ${basicBlueColour};
  }
`

export const TitleInput = styled.textarea `
  background-color: transparent !important;
  overflow-x: hidden;
  overflow-y: hidden;
  padding-left: 6px;
  resize: none;
  font-size: 1.5em;
  font-weight: 300;
  height: 40px;
  outline: none !important;
  border: 1px solid #f6f6f6;
  width: auto;

  &:focus{
    background-color: white !important;
    border: 1px solid ${basicBlueColour} !important;
  }

  &[type=checkbox]{
    width: 1em;
  }

  &:disabled{
      background-color: transparent !important;
    }
`;

export const TitleCheckbox = styled.input `
  background-color: transparent !important;
  font-size: 2em;
  font-weight: 300;
  height: 2em;
  outline: none !important;
  border: none !important;
  width: auto;

  &:focus{
    background-color: white !important;
    border: 1px solid ${basicBlueColour};
    padding: 0.3em;
  }

  &[type=checkbox]{
    width: 1em;
  }
`;

export const Input = styled.input `
  background-color: white !important;
  outline: none !important;
  border: ${(props) => props.error ? "1px solid red" : "0px solid #d6d6d6"};
  width: ${(props) => props.width ? props.width : "auto"};
  padding-left: 0.4em;
  height: 2.5em !important;
  border-radius: 0px !important;
  box-shadow: none !important;

  &:focus{
    border: 1px solid ${basicBlueColour} !important;
  }

  &[type=checkbox]{
      vertical-align: middle;
  }

    &:disabled{
        background-color: transparent !important;
      }
`;

export const InlineInput = styled.div `
  padding: 0em ${inputOffset};

  input{
    padding: 7px;
    background-color: white !important;
    outline: none !important;
    border: none;
    width: fill-available;
    height: 2.5em !important;
  }

  input:disabled{
    background-color: transparent !important;
  }

  img{
    margin-left: 0.6em;
  }

  button.connected-btn{
    background-color: white !important;
  }
`;

export const HiddenInput = styled.input `
    padding: 7px;
    background-color: transparent !important;
    outline: none !important;
    border: none;
    width: fill-available;
    height: 2.5em !important;
    margin-right: 0.3em;

  &:focus{
    background-color: white !important;
    border: 0px solid #d6d6d6;
  }

  &:disabled{
      background-color: transparent !important;
    }
`;

export const Textarea = styled.textarea `
  background-color: white !important;
  outline: none !important;
  border: ${(props) => props.error ? "1px solid red" : "0px solid #d6d6d6"};
  width: ${(props) => props.width ? props.width : "auto"};
  padding-left: 0.4em;

  &:focus{
    border: 1px solid ${basicBlueColour} !important;
  }

  &:disabled{
      background-color: transparent !important;
    }
`;

export const HiddenTextarea = styled.textarea `
    height: 2.5em !important;
    padding: 7px;
    background-color: white !important;
    outline: none !important;
    border: ${(props) => props.error ? "1px solid red" : "0px solid #d6d6d6"};
    width: ${(props) => props.width ? props.width : "auto"};
    margin-right: 0.3em;

  ::placeholder{
    color: ${basicBlueColour};
  }

  &:focus{
    background-color: white !important;
    border: 0px solid #d6d6d6;
    height: 4em !important;
  }

  &:disabled{
      background-color: transparent !important;
    }
`;

export const Sort = styled.div`
  position: absolute;
  z-index: 999;
  background-color: white;
  box-shadow: 0px 0px 7px 0px slategrey;
  width: 350px;
  top: 50px;
  right: 20px;
  padding: ${inputOffset};

  span{
    display: flex;
    align-items: center;
    line-height: 2em;
  }

  input{
    height: 1.3em;
    width: 1.3em;
    margin-right: 0.6em;
  }
`;

export const Filter = styled.div`
  position: absolute;
  z-index: 999;
  background-color: #f6f6f6;
  box-shadow: 0px 0px 7px 0px slategrey;
  top: 50px;
  @media all and (max-width: 799px), @media handheld {
    width: 100%;
    right: 0;
  }
  @media all and (min-width: 800px){
    width: 800px;
    right: calc(50vw - 400px);
  }
  padding: 0;

  span{
    display: flex;
    align-items: center;
    line-height: 2em;
  }

  input{
    height: 1.3em;
    width: 1.3em;
  }
`;

export const Notifications = styled.div`
  position: absolute;
    overflow-y: auto;
  z-index: 999;
  background-color: white;
  box-shadow: 0px 0px 7px 0px slategrey;
  width: 350px;
  height: calc(100vh - 50px);
  top: 50px;
  right: 20px;
  padding: ${inputOffset};

  .notification{
    padding: 0.6em;
    margin-bottom: 1em;
    cursor: pointer;
  }

  .notification:last-of-type{
    margin-bottom: 0em;
  }

  .notification p:first-of-type{
    color: ${basicBlueColour};
    display: flex;
    align-items: center;
    margin-bottom: 0.3em;
  }

  .notification p:first-of-type input{
    width: 1.5em;
    height: 1.5em;
  }

  .notification p:first-of-type span{
      margin-left: auto;
    }

  .notification p:last-of-type{
    margin: 0px;
  }

  .mark-read{
    display: flex;
    align-items: center;
  }

  .header{
    display: flex;
    align-items: flex-end;
  }

  .header .left{
    margin-left: auto;
  }
`;

export const DatetimePicker = styled.div`
  position: absolute;
  z-index: 999;
  background-color: #f6f6f6;
  box-shadow: 0px 0px 7px 0px slategrey;
  top: 0px;
  @media all and (max-width: 799px), @media handheld {
    width: 100%;
  }
  @media all and (min-width: 800px){
    width: -webkit-fill-available;
  }
  padding: 2em 0em;

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

  margin: auto;

  &>div{
      height: -webkit-fill-available;
      width: inherit;
      background-color: ${backgroundColour};
      position: relative;
      display: flex;
      align-items: center;
  }

  .signIn{
    height: calc(100vh - 50px);
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
  align-items: center;
  margin-bottom: 0.5em;

  div {
    display: inline-block;
  }

  label.name {
    color: black;
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

export const CommentContainer = styled.div`
  align-items: center;
  padding-top: 0.6em;
  border-top: 1px solid #d6d6d6;

  div {
    display: flex;
    align-items: center;
  }

  img.avatar{
    width: 32px;
    height: 32px;
    border-radius: 16px;
  }

  label.name {
    display: block;
    font-weight: 500;
    color: black;
    margin-left: 0.6em;
  }

  p.body {
    display: block;
    font-weight: 400;
    padding: 0.6em 0em;
  }

  span.dateCreated{
    margin-left: auto;
    font-size: 0.9em;
  }
`;

export const FileContainer = styled.div`
  display: inline-block;
  align-items: center;
  line-height: 1.6em;
  margin-right: 0.6em;
  margin-bottom: 0.6em;
  border-right: 1px solid ${basicBlueColour};
  padding-right: 0.6em;

  a{
    display: inline;
    text-decoration: none;
    vertical-align: -webkit-baseline-middle;
  }

  button{
    display: inline;
    width: 1em;
    height: 1em;
    margin-left: 0.3em;
    vertical-align: -webkit-baseline-middle;
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
  }

  div span.sr-only{
    display: none;
  }
`;

export const AppliedFilter = styled.section`
  padding: 1em ${inputOffset};
  color: ${basicBlueColour};

  .filter{
    background-color: ${lightBlueColour};
    margin-right: 1em;
    margin-bottom: 0.3em;
    display: inline-block;
    height: 2em;
  }

  .filter-container{
    height: -webkit-fill-available;
    display: flex;
    align-items: center;
  }

  img, label{
    margin-right: 0.3em;
  }

  img{
      filter: invert(32%) sepia(81%) saturate(4601%) hue-rotate(210deg) brightness(90%) contrast(101%);
  }

`;
