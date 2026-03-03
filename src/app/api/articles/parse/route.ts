import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomBytes } from "crypto";

const s3 = new S3Client({
    region: process.env.AWS_REGION ?? "ap-southeast-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

const BUCKET = process.env.S3_BUCKET ?? "insights-digest";
const PREFIX = process.env.S3_PREFIX ?? "article/images";
const MAX_IMG_SIZE = 5 * 1024 * 1024; // 5 MB

const MIME_EXT: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/tiff": "tiff",
};

async function uploadDataUri(dataUri: string): Promise<string> {
    const match = dataUri.match(/^data:(image\/[^;]+);base64,([\s\S]+)$/);
    if (!match) return dataUri;

    const mimeType = match[1];
    const base64data = match[2];
    const ext = MIME_EXT[mimeType] ?? "jpg";
    const buffer = Buffer.from(base64data, "base64");

    if (buffer.length > MAX_IMG_SIZE) return dataUri; // skip if too large

    const key = `${PREFIX}/${randomBytes(10).toString("hex")}.${ext}`;

    await s3.send(
        new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: buffer,
            ContentType: mimeType,
            CacheControl: "public, max-age=31536000, immutable",
        })
    );

    return `https://${BUCKET}.s3.${process.env.AWS_REGION ?? "ap-southeast-1"}.amazonaws.com/${key}`;
}

async function processHtmlImages(html: string): Promise<string> {
    // Match all data URI image src attributes
    const pattern = /src="(data:image\/[^"]+)"/g;
    const matches = [...html.matchAll(pattern)];
    if (matches.length === 0) return html;

    // Upload all in parallel, silently skip failures
    const results = await Promise.allSettled(
        matches.map(async (m) => ({ original: m[1], url: await uploadDataUri(m[1]) }))
    );

    let result = html;
    for (const r of results) {
        if (r.status === "fulfilled" && r.value.url !== r.value.original) {
            // Replace only the first occurrence to avoid double-replace
            result = result.replace(`src="${r.value.original}"`, `src="${r.value.url}"`);
        }
    }
    return result;
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const ext = file.name.split(".").pop()?.toLowerCase();
        if (ext !== "docx") {
            return NextResponse.json({ error: "Only .docx files are supported" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const result = await mammoth.convertToHtml(
            { buffer },
            {
                styleMap: [
                    "p[style-name='Title'] => h1:fresh",
                    "p[style-name='Subtitle'] => h2:fresh",
                    "p[style-name='Heading 1'] => h1:fresh",
                    "p[style-name='Heading 2'] => h2:fresh",
                    "p[style-name='Heading 3'] => h3:fresh",
                ],
            }
        );

        // Upload embedded base64 images to S3
        const html = await processHtmlImages(result.value);

        return NextResponse.json({ html });
    } catch {
        return NextResponse.json({ error: "Failed to parse document" }, { status: 500 });
    }
}
