const CLOUDINARY_CLOUD_NAME = "dopo6gjfq";
const CLOUDINARY_UPLOAD_PRESET = "Talkbuzz";

export async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
    {
      method: "POST",
      body: formData
    }
  );
  
  const data = await res.json();
  return data.secure_url;
}
