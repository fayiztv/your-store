import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';

// Real time settings hook ------ updates instantly when admin changes settings
export default function useSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'settings', 'main'),
      (snap) => {
        setSettings(snap.exists() ? snap.data() : null);
        setLoading(false);
      },
      () => {
        setSettings(null);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  return { settings, loading };
}