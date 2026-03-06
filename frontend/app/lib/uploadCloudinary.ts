import api from "./axios";

export const uploadToCloudinary = async (
  file: File
): Promise<string> => {
  const { data } = await api.get("/post/cloudinary-signature");

  const form = new FormData();

  form.append("file", file);
  form.append("api_key", data.apiKey);
  form.append("timestamp", data.timestamp);
  form.append("signature", data.signature);
  form.append("folder", data.folder);

  const upload = await fetch(
    `https://api.cloudinary.com/v1_1/${data.cloudName}/auto/upload`,
    {
      method: "POST",
      body: form,
    }
  );

  const json = await upload.json();

  return json.secure_url;
};