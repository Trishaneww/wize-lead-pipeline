import { sourcePlaces } from "./sourcePlaces";
import { ingestLeads } from "./ingestLeads";
import { auditLead } from "./auditLead";
import { qualifyLead } from "./qualifyLead";
import { draftOutreach } from "./draftOutreach";

export const functions = [
  sourcePlaces,
  ingestLeads,
  auditLead,
  qualifyLead,
  draftOutreach,
];
