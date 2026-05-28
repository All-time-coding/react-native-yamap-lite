import { useState, useCallback } from 'react';

const MAX_EVENTS = 5;

export const useEventLog = () => {
  const [events, setEvents] = useState<string[]>([]);

  const log = useCallback((message: string) => {
    const time = new Date().toLocaleTimeString('ru', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setEvents((prev) => [`[${time}] ${message}`, ...prev].slice(0, MAX_EVENTS));
  }, []);

  return { events, log };
};
