import { sourcePlaces } from "./sourcePlaces";
import { ingestLeads } from "./ingestLeads";
import { auditLead } from "./auditLead";
import { qualifyLead } from "./qualifyLead";
import { draftOutreach } from "./draftOutreach";
import { batchQualifyLeads } from "./batchQualifyLeads";
import { batchDraftOutreach } from "./batchDraftOutreach";

export const functions = [
  sourcePlaces,
  ingestLeads,
  auditLead,
  qualifyLead,
  draftOutreach,
  batchQualifyLeads,
  batchDraftOutreach,
];
