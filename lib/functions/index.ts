import { ingestLeads } from "./ingestLeads";
import { auditLead } from "./auditLead";
import { qualifyLead } from "./qualifyLead";
import { draftOutreach } from "./draftOutreach";

export const functions = [ingestLeads, auditLead, qualifyLead, draftOutreach];
