export const selectStyle = {
  control: ( base, state ) => ( {
    ...base,
    minHeight: 30,
    backgroundColor: 'white',
    border: state.isFocused ? "0px solid #0078d4" : "none",
    borderRadius: 0,
    width: "100%",
  } ),
  dropdownIndicator: base => ( {
    ...base,
    color: "transparent",
    padding: 4,
  } ),
  clearIndicator: base => ( {
    ...base,
    padding: 4,
  } ),
  multiValue: ( base, {
    data
  } ) => {
    return {
      ...base,
      backgroundColor: data.color ? data.color : "#F2F1F1",
      borderRadius: 0,
    };
  },
  multiValueLabel: ( base, {
    data
  } ) => ( {
    ...base,
    color: data.color ? "white" : "black",
  } ),
  multiValueRemove: ( styles, {
    data
  } ) => ( {
    ...styles,
    color: data.color ? "white" : "black",
    backgroundColor: data.color ? data.color : "#F2F1F1",
    ':hover': {
      backgroundColor: "rgba(0,0,0,0.5)",
      color: 'white',
    },
  } ),
  valueContainer: base => ( {
    ...base,
    padding: '0px 6px',
    borderRadius: 0,
    font: '14px Segoe UI',
    color: '#333',
  } ),
  input: base => ( {
    ...base,
    margin: 0,
    padding: 0,
    backgroundColor: "inherit",
    borderRadius: 0
  } ),
  indicatorSeparator: base => ( {
    ...base,
    width: 0,
  } ),
  placeholder: base => ( {
    ...base,
    font: '14px Segoe UI',
    color: '#777',
  } ),
  menu: base => ( {
    ...base,
    zIndex: 50,
  } ),
};