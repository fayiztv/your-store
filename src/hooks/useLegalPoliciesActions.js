import { doc, setDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { db } from "../firebase/firebase";

export default function useLegalPoliciesActions(legalPoliciesData) {
  async function handleSavePolicies() {
    try {
      await setDoc(
        doc(db, "settings", "main"),
        {
          legalPolicies: legalPoliciesData.legalPolicies,
        },
        { merge: true },
      );

      toast.success("Policies saved");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save policies");
    }
  }

  return {
    handleSavePolicies,
  };
}