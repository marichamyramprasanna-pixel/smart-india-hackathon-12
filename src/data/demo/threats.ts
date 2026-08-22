/**
 * DEMO SCENARIO DATASET — ISOLATED THREAT ALERTS
 * Used exclusively for the interactive SOC simulation showcase.
 * Real production data is queried directly from Supabase via `src/services/alertService.ts`.
 */
import { ThreatAlert } from '../../types/threat'
import { mockThreats } from '../../api/threats'

export const demoThreats: ThreatAlert[] = mockThreats
