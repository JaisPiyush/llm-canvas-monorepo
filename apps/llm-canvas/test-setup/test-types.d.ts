/* eslint-disable @typescript-eslint/no-explicit-any */
import { MockedFunction } from 'vitest'

declare global {
  var mockContextBridge: {
    exposeInMainWorld: MockedFunction<any>
  }
  var mockIpcRenderer: {
    invoke: MockedFunction<any>
    send: MockedFunction<any>
    on: MockedFunction<any>
    once: MockedFunction<any>
    removeListener: MockedFunction<any>
    removeAllListeners: MockedFunction<any>
  }
  var mockCanvas: any
  var mockElectron: any
}

export {}
