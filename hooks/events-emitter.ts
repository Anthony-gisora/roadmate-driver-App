class SimpleEmitter {
    events: Record<string, Function[]> = {};

    on(event: string, listener: Function) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push(listener);
    }

    off(event: string, listener: Function) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(l => l !== listener);
    }

    emit(event: string, ...args: any[]) {
        if (!this.events[event]) return;
        this.events[event].forEach(listener => listener(...args));
    }
}

export const socketEvents = new SimpleEmitter();
