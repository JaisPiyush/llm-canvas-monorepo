
import { DisposableEvent } from "./types"

export class DisposableEventEmitter<T> {
    private listeners: Array<(e: T) => any> = []
  
    get event(): DisposableEvent<T> {
      return (listener: (e: T) => any) => {
        this.listeners.push(listener)
        return {
          dispose: () => {
            const index = this.listeners.indexOf(listener)
            if (index >= 0) {
              this.listeners.splice(index, 1)
            }
          }
        }
      }
    }
  
    fire(event: T): void {
      for (const listener of this.listeners) {
        try {
          listener(event)
        } catch (error) {
          console.error('Error in event listener:', error)
        }
      }
    }
  
    dispose(): void {
      this.listeners = []
    }
  }