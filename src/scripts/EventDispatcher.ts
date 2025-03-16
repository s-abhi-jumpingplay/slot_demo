type EventHandler = (...args: any[]) => void;

export class EventDispatcher {
  private handlers: { [event: string]: EventHandler[] } = {};
  private static instance: EventDispatcher | null = null;

  private constructor() {}

  public static getInstance(): EventDispatcher {
    if (!EventDispatcher.instance) {
      EventDispatcher.instance = new EventDispatcher();
    }
    return EventDispatcher.instance;
  }

  public addEventListener(event: string, handler: EventHandler): void {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    this.handlers[event].push(handler);
  }

  public removeEventListener(event: string, handler: EventHandler): void {
    const eventHandlers = this.handlers[event];
    if (eventHandlers) {
      const index = eventHandlers.indexOf(handler);
      if (index !== -1) {
        eventHandlers.splice(index, 1);
      }
    }
  }

  public dispatchEvent(event: string, ...args: any[]): void {
    const eventHandlers = this.handlers[event];
    if (eventHandlers) {
      for (const handler of eventHandlers) {
        handler(...args);
      }
    }
  }
}
