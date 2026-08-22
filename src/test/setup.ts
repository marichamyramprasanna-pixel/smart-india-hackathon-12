import '@testing-library/jest-dom'
import WebSocket from 'ws'

if (typeof globalThis.WebSocket === 'undefined') {
  // @ts-expect-error - WebSocket polyfill for vitest
  globalThis.WebSocket = WebSocket
}
