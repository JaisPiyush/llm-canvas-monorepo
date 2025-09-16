import { ElectronAPI } from '@electron-toolkit/preload'
import { CanvasAPI } from '@shared/types/core'

declare global {
  interface Window {
    electron: ElectronAPI
    canvas: CanvasAPI
  }
}
