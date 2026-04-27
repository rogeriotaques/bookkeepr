type Handler = () => void;

const listeners: Handler[] = [];

export const authEvents = {
  on: (handler: Handler) => listeners.push(handler),
  off: (handler: Handler) => {
    const idx = listeners.indexOf(handler);
    if (idx > -1) listeners.splice(idx, 1);
  },
  emit: () => listeners.forEach((h) => h()),
};
