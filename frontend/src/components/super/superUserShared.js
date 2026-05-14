export const initialUserForm = {
  firstName: "",
  lastName: "",
  username: "",
  password: ""
};

export const initialJournalForm = {
  ownerUserId: "",
  managingJournalName: "",
  journalDomainName: "",
  journalUrl: "",
  aboutJournal: "",
  journalInstructions: "",
  firstName: "",
  lastName: "",
  username: "",
  password: "",
  coverImage: "",
  coverImageFile: null,
  pptFile: null,
  pptPreviewFile: null,
  pdfFile: null,
  videoFile: null
};

export const initialTestimonialForm = {
  name: "",
  designation: "",
  message: "",
  image: null
};

export const defaultUserMeta = {
  total: 0,
  page: 1,
  pageSize: 10,
  totalPages: 1,
  orderBy: "date",
  direction: "desc",
  search: ""
};

export function normalizeItem(item) {
  return {
    ...item,
    id: item.id || item._id
  };
}

export function mapUserToForm(item) {
  return {
    firstName: item?.firstName || "",
    lastName: item?.lastName || "",
    username: item?.username || "",
    password: ""
  };
}

export function mapJournalToForm(journal) {
  return {
    ownerUserId: journal?.ownerUserId || "",
    managingJournalName: journal?.managingJournalName || "",
    journalDomainName: journal?.journalDomainName || "",
    journalUrl: journal?.journalUrl || "",
    aboutJournal: journal?.aboutJournal || "",
    journalInstructions: journal?.journalInstructions || "",
    coverImage: journal?.coverImage || "",
    coverImageFile: null,
    firstName: journal?.firstName || "",
    lastName: journal?.lastName || "",
    username: journal?.username || journal?.ownerUsername || "",
    password: "",
    pptFile: null,
    pptPreviewFile: null,
    pdfFile: null,
    videoFile: null
  };
}

export function mapTestimonialToForm(item) {
  return {
    name: item?.name || "",
    designation: item?.designation || "",
    message: item?.message || "",
    image: null
  };
}
