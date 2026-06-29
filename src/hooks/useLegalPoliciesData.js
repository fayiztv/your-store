import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";

export default function useLegalPoliciesData() {
  const [legalPolicies, setLegalPolicies] = useState({
    privacy: {
      content: "",
    },
    terms: {
      content: "",
    },
    refund: {
      content: "",
    },
    // payment: {
    //   content: "",
    // },
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "settings", "main"),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();

          if (data.legalPolicies) {
            setLegalPolicies({
              privacy: {
                content: data.legalPolicies.privacy?.content ?? "",
              },

              terms: {
                content: data.legalPolicies.terms?.content ?? "",
              },

              refund: {
                content: data.legalPolicies.refund?.content ?? "",
              },

            //   payment: {
            //     content: data.legalPolicies.payment?.content ?? "",
            //   },
            });
          }
        }

        setLoading(false);
      },
      () => setLoading(false),
    );

    return unsubscribe;
  }, []);

  return {
    legalPolicies,
    setLegalPolicies,
    loading,
  };
}
