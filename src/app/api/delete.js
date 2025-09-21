import { deleteFromUrl } from "@/lib/deleteAsset";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { url, type } = req.body;

  try {
    const result = await deleteFromUrl(url, type);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to delete asset" });
  }
}
