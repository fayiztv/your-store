import { useState } from "react";

export default function useProductForm() {
  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] =
    useState("");

  return {
    name,
    setName,
    description,
    setDescription,
    price,
    setPrice,
    offerPrice,
    setOfferPrice,
  };
}