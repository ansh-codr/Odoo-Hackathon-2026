import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../lib/firebase";
import { logActivity } from "./logService";

export async function uploadAssetFile(assetId: string, file: File): Promise<string> {
  const filePath = `assets/${assetId}/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, filePath);
  
  const snapshot = await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(snapshot.ref);
  
  await logActivity(
    "Upload File", 
    `Uploaded file ${file.name} for asset ${assetId}. Path: ${filePath}`
  );
  
  return downloadUrl;
}
