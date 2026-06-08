import {
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";

import { storage } from "./config";

export function uploadImage(
  file,
  onProgress
) {
  const storageRef = ref(
    storage,
    `products/${Date.now()}_${file.name}`
  );

  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(
      storageRef,
      file
    );

    task.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred /
            snapshot.totalBytes) *
          100;

        onProgress?.(progress);
      },
      reject,
      async () => {
        const url =
          await getDownloadURL(
            task.snapshot.ref
          );

        resolve(url);
      }
    );
  });
}