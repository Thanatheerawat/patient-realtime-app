// Central definition of every patient-form field: what it's called, how it's
// rendered, whether it's required, and which section of the form it belongs to.
// Both the patient form and the staff view read from this single source of
// truth so the two stay in sync automatically.

export const GENDER_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"];

export const LANGUAGE_OPTIONS = [
  "Thai",
  "English",
  "Chinese",
  "Japanese",
  "Other",
];

export const FIELD_SECTIONS = [
  {
    title: "Personal Information",
    fields: [
      { name: "firstName", label: "First Name", type: "text", required: true },
      { name: "middleName", label: "Middle Name", type: "text", required: false },
      { name: "lastName", label: "Last Name", type: "text", required: true },
      { name: "dob", label: "Date of Birth", type: "date", required: true },
      { name: "gender", label: "Gender", type: "select", options: GENDER_OPTIONS, required: true },
      { name: "nationality", label: "Nationality", type: "text", required: true },
      { name: "religion", label: "Religion", type: "text", required: false },
    ],
  },
  {
    title: "Contact Information",
    fields: [
      { name: "phone", label: "Phone Number", type: "tel", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "address", label: "Address", type: "textarea", required: true },
      { name: "preferredLanguage", label: "Preferred Language", type: "select", options: LANGUAGE_OPTIONS, required: true },
    ],
  },
  {
    title: "Emergency Contact (optional)",
    fields: [
      { name: "emergencyContactName", label: "Contact Name", type: "text", required: false },
      { name: "emergencyContactRelationship", label: "Relationship", type: "text", required: false },
    ],
  },
];

export const ALL_FIELDS = FIELD_SECTIONS.flatMap((section) => section.fields);

export const REQUIRED_FIELDS = ALL_FIELDS.filter((f) => f.required).map((f) => f.name);

export const EMPTY_FORM = ALL_FIELDS.reduce((acc, f) => {
  acc[f.name] = "";
  return acc;
}, {});

export function fieldLabel(name) {
  return ALL_FIELDS.find((f) => f.name === name)?.label ?? name;
}
