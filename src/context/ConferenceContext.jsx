// src/context/ConferenceContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { getConferences } from '../lib/firestore';

const ConferenceContext = createContext(null);

export function ConferenceProvider({ children }) {
  const [conferences, setConferences] = useState([]);
  const [activeConference, setActiveConference] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadConferences = async () => {
    try {
      const data = await getConferences();
      setConferences(data);
      // Auto-select the first non-archived conference
      const active = data.find(c => !c.archived);
      if (active && !activeConference) {
        setActiveConference(active);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConferences();
  }, []);

  return (
    <ConferenceContext.Provider value={{ conferences, activeConference, setActiveConference, loading, reload: loadConferences }}>
      {children}
    </ConferenceContext.Provider>
  );
}

export const useConference = () => useContext(ConferenceContext);
