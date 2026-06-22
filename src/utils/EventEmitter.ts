/**
 * Event callback function type
 * @template T - Type of data passed to the callback
 */
export type EventCallback<T = any> = (data: T) => void;

/**
 * Type-safe Event Emitter implementation
 * @template TEvents - Record type mapping event names to their data types
 *
 * @example
 * interface MyEvents {
 *   'login': { userId: string };
 *   'logout': void;
 * }
 * const emitter = new EventEmitter<MyEvents>();
 */
export default class EventEmitter<TEvents extends Record<string, any>> {
  /**
   * Internal storage for event listeners
   * Maps each event name to an array of callback functions
   * Using mapped type for type safety
   */
  private events: { [K in keyof TEvents]?: EventCallback<TEvents[K]>[] } = {};

  /**
   * Subscribe to an event
   * @param event - Name of the event to listen to
   * @param callback - Function to execute when event is emitted
   */
  on<K extends keyof TEvents>(
    event: K,
    callback: EventCallback<TEvents[K]>,
  ): void {
    // Initialize array if no listeners exist for this event
    if (!this.events[event]) {
      this.events[event] = [];
    }
    // Add callback to the listeners array
    this.events[event]!.push(callback);
  }
  /**
   * Subscribe to an event once - automatically unsubscribes after first emission
   * @param event - Name of the event to listen to
   * @param callback - Function to execute when event is emitted (only once)
   */
  once<K extends keyof TEvents>(
    event: K,
    callback: EventCallback<TEvents[K]>,
  ): void {
    // Create a wrapper that unsubscribes itself after execution
    const onceCallback: EventCallback<TEvents[K]> = (data) => {
      callback(data);
      this.off(event, onceCallback); // Self-removal after first call
    };
    this.on(event, onceCallback);
  }
  /**
   * Emit an event, triggering all subscribed callbacks
   * @param event - Name of the event to emit
   * @param data - Optional data to pass to callbacks (type-safe based on event)
   */
  emit<K extends keyof TEvents>(event: K, data?: TEvents[K]): void {
    // Execute all callbacks registered for this event
    // Optional chaining prevents errors if no listeners exist
    this.events[event]?.forEach((callback) => callback(data!));
  }
  /**
   * Unsubscribe from an event
   * @param event - Name of the event to unsubscribe from
   * @param callback - The specific callback function to remove
   */
  off<K extends keyof TEvents>(
    event: K,
    callback: EventCallback<TEvents[K]>,
  ): void {
    // Do nothing if no listeners exist for this event
    if (!this.events[event]) return;
    // Filter out the specified callback
    this.events[event] = this.events[event]!.filter((cb) => cb !== callback);
  }
  /**
   * Remove all event listeners
   * Prevents memory leaks when the emitter is no longer needed
   */
  destroyEmitter(): void {
    this.events = {};
  }
}
