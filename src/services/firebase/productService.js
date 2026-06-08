import {
  addDoc,
  collection,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./config";

export async function getProduct(id) {
  const snap = await getDoc(doc(db, "products", id));

  if (!snap.exists()) {
    throw new Error("Product not found");
  }

  return {
    id: snap.id,
    ...snap.data(),
  };
}

export async function createProduct(data) {
  return addDoc(
    collection(db, "products"),
    {
      ...data,
      createdAt: serverTimestamp(),
    }
  );
}

export async function updateProductData(id, data) {
  return updateDoc(
    doc(db, "products", id),
    data
  );
}