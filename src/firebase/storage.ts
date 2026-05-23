import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
  UploadTaskSnapshot,
} from "firebase/storage";
import { app } from "./config";

export const storage = getStorage(app);

export type UploadKind = "avatar" | "payment" | "subtitle" | "banner";

export type UploadOptions = {
  uid: string;
  file: File;
  kind: UploadKind;
  onProgress?: (percent: number, snapshot: UploadTaskSnapshot) => void;
};

const allowedTypes: Record<UploadKind, string[]> = {
  avatar: ["image/png", "image/jpeg", "image/webp"],
  payment: ["image/png", "image/jpeg", "image/webp"],
  subtitle: ["text/vtt", "application/x-subrip", "text/plain"],
  banner: ["image/png", "image/jpeg", "image/webp"],
};

const maxBytes: Record<UploadKind, number> = {
  avatar: 4 * 1024 * 1024,
  payment: 8 * 1024 * 1024,
  subtitle: 2 * 1024 * 1024,
  banner: 8 * 1024 * 1024,
};

export function validateUpload(file: File, kind: UploadKind) {
  const ext = file.name.toLowerCase();
  const isSubtitleExt = ext.endsWith(".vtt") || ext.endsWith(".srt");
  const allowed = allowedTypes[kind];
  if (kind === "subtitle") {
    if (!isSubtitleExt) throw new Error("Solo se permite .vtt o .srt.");
  } else if (!allowed.includes(file.type)) {
    throw new Error("Formato de archivo no permitido.");
  }
  if (file.size > maxBytes[kind]) {
    throw new Error(`Archivo demasiado grande. Max ${Math.floor(maxBytes[kind] / 1024 / 1024)}MB.`);
  }
}

export async function uploadFileWithProgress({ uid, file, kind, onProgress }: UploadOptions) {
  validateUpload(file, kind);
  const safeName = file.name.replace(/\s+/g, "-");
  const path = `${kind}s/${uid}/${Date.now()}-${safeName}`;
  const storageRef = ref(storage, path);
  const task = uploadBytesResumable(storageRef, file);

  await new Promise<void>((resolve, reject) => {
    task.on(
      "state_changed",
      (snapshot) => {
        if (!onProgress) return;
        const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        onProgress(percent, snapshot);
      },
      (error) => reject(error),
      () => resolve(),
    );
  });

  const url = await getDownloadURL(task.snapshot.ref);
  return { url, path };
}

export async function deleteUploadedFile(path: string) {
  await deleteObject(ref(storage, path));
}
