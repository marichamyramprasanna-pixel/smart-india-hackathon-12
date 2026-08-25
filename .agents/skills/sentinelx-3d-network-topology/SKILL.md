---
name: sentinelx-3d-network-topology
description: >-
  Procedures and architecture for the WebGL 3D Spatial Network Topology Visualizer,
  dynamic orbital layout, quarantine cages, and packet stream animations.
---

# SentinelX 3D Spatial Network Topology Visualizer

This skill outlines the WebGL 3D rendering pipeline for real-time network topology visualization using Three.js, React Three Fiber, and Drei.

---

## 1. Dynamic Topology Generation (`src/utils/topologyGenerator.ts`)

- **Standby Mode (0 Devices)**: If `devices.length === 0`, returns `{ nodes: [], links: [] }` and activates the **3D Canvas Standby Overlay**.
- **Active Topology Building**: As soon as devices are registered, dynamically anchors:
  1. **Central Core Switch / Router (`node-core-router`)** at `[0, 0, 0]`.
  2. **Perimeter Next-Gen Firewall (`node-firewall-01`)** at `[-5.5, 0.5, 0]`.
  3. **Monitored Endpoints**: Positioned in dynamic spherical orbital rings based on inventory size and device type.
  4. **Blocked Adversary IPs**: Rendered outside perimeter firewall with severed red drop links.
  5. **Decommissioned Tombstones**: Rendered in outer Archival Orbit (`zone: 'Archival Vault'`) as amber translucent wireframe holograms.

---

## 2. Visual Node Geometries & Materials (`src/components/network3d/NetworkNodes.tsx`)

| Device State | Three.js Geometry & Shader | Visual Indicator |
| :--- | :--- | :--- |
| **Healthy Endpoint** | Cyan Sphere / Cylinder (`#00F0FF`) | Smooth flowing packet streams |
| **Suspicious** | Amber Octahedron (`#FB923C`) | Pulsing yellow traffic link |
| **Compromised** | Deep Crimson Icosahedron (`#DC2626`) | High-speed red particle stream |
| **802.1X Quarantined** | Rose Red with **Pulsing Wireframe Cage** (`#F43F5E`) | Severed null-routed link (0 packets) |
| **Blocked Perimeter IP** | Attacker Octahedron with Firewall Drop Barrier | Red null-routed drop line |
| **Decommissioned** | Amber Ghost Wireframe Hologram (`opacity: 0.45`) | Faint archival link |

---

## 3. Interactive Node Forensic Drawer (`src/components/network3d/NodeDetailsDrawer.tsx`)

Clicking any 3D node in the WebGL canvas opens the drawer with live actions:
- **1-Click Quarantine Host (802.1X)** ➔ Instantly spawns quarantine cage in 3D.
- **1-Click Release Quarantine** ➔ Lifts cage and restores normal packet flow.
- **1-Click Restore Tombstone** ➔ Recovers deleted device back to active 3D topology.
- **1-Click Unblock IP** ➔ Removes perimeter firewall drop rule.
