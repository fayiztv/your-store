import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

export default function useSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchSettings() {
      try {
        const snap = await getDoc(doc(db, 'settings', 'main'));
        if (!cancelled) {
          setSettings(snap.exists() ? snap.data() : null);
        }
      } catch {
        if (!cancelled) {
          setSettings(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  return { settings, loading };
}
