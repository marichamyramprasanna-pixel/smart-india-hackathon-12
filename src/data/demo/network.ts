/**
 * DEMO SCENARIO DATASET — 3D TOPOLOGY FIXTURES
 * Used for the spatial 3D network topology visualization demo.
 */
import { Network3DNode, Network3DLink, NetworkTelemetrySnapshot } from '../../types/network'
import { mock3DNodes, mock3DLinks, mockTelemetrySnapshot } from '../../api/network'

export const demo3DNodes: Network3DNode[] = mock3DNodes
export const demo3DLinks: Network3DLink[] = mock3DLinks
export const demoTelemetrySnapshot: NetworkTelemetrySnapshot = mockTelemetrySnapshot
