export const WHOLE_TABLE = "all";
export const MY_TASKS = "my-tasks";
export const PLANNED = "planned";
export const IMPORTANT = "important";
export const WITH_ACTIONS = 'actions';
export const WITH_MATERIALS = 'materials';

export const columns = {
  STATUS: {
    label: "Status",
    value: "status",
    width: {
      all: "5%",
      actions: "",
      materials: "",
    }
  },
  TITLE: {
    label: "Title",
    value: "title",
    width: {
      all: "10%",
      actions: "",
      materials: "",
    }
  },
  DESCRIPTION: {
    label: "Description",
    value: "description",
    width: {
      all: "20%",
      actions: "",
      materials: "",
    }
  },
  ACTIONS: {
    label: "Actions",
    value: "actions",
    width: {
      all: "15%",
      actions: "",
      materials: "",
    }
  },
  DURATION: {
    label: "Duration",
    value: "duration",
    width: {
      all: "5%",
      actions: "",
      materials: "",
    }
  },
  MATERIAL: {
    label: "Material",
    value: "material",
    width: {
      all: "15%",
      actions: "",
      materials: "",
    }
  },
  ASSIGNED: {
    label: "Assigned",
    value: "assigned",
    width: {
      all: "15%",
      actions: "",
      materials: "",
    }
  },
  DEADLINES: {
    label: "Deadlines",
    value: "deadline",
    width: {
      all: "15%",
      actions: "",
      materials: "",
    }
  },
}

export const ALL_COLUMNS = [ columns.STATUS, columns.TITLE, columns.DESCRIPTION, columns.ASSIGNED, columns.DEADLINES, columns.ACTIONS, columns.DURATION, columns.MATERIAL ];
export const ACTIONS_COLUMNS = [ columns.STATUS, columns.TITLE, columns.DESCRIPTION, columns.ASSIGNED, columns.DEADLINES, columns.ACTIONS, columns.DURATION, columns.MATERIAL ];
export const MATERIAL_COLUMNS = [ columns.MATERIAL, columns.TITLE, columns.STATUS, columns.ASSIGNED ];

export const statuses = [
  {
    label: "Open",
    value: false,
    colour: "#00b294"
  },
  {
    label: "Closed",
    value: true,
    colour: "#6f6262"
      }
]
