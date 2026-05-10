import Contact from "../models/Contact.js";
import { ensureSuperAdmin } from "../utils/accessControl.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createContact = asyncHandler(async (req, res) => {
  const contact = await Contact.create(req.body);
  res.status(201).json(contact);
});

export const getContacts = asyncHandler(async (req, res) => {
  ensureSuperAdmin(req.user);
  const contacts = await Contact.find().sort({ createdAt: -1 }).lean();
  res.json(contacts);
});
