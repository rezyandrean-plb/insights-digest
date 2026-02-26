import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomBytes } from "crypto";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const s3 = new S3Client({
    region: process.env.AWS_REGION ?? "ap-southeast-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

const BUCKET = process.env.S3_BUCKET ?? "insights-digest";
const PREFIX = process.env.S3_PREFIX ?? "article/images";

export async function POST(req: NextRequest) {
    try {
        const form = await req.formData();
        const file = form.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided." }, { status: 400 });
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: "Only JPEG, PNG, WebP, or GIF images are allowed." },
                { status: 400 }
            );
        }

        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { error: "File is too large. Maximum size is 5 MB." },
                { status: 400 }
            );
        }

        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const filename = `${randomBytes(10).toString("hex")}.${ext}`;
        const key = `${PREFIX}/${filename}`;

        const buffer = Buffer.from(await file.arrayBuffer());

        await s3.send(
            new PutObjectCommand({
                Bucket: BUCKET,
                Key: key,
                Body: buffer,
                ContentType: file.type,
                CacheControl: "public, max-age=31536000, immutable",
            })
        );

        const url = `https://${BUCKET}.s3.${process.env.AWS_REGION ?? "ap-southeast-1"}.amazonaws.com/${key}`;

        return NextResponse.json({ url });
    } catch (err) {
        console.error("[upload]", err);
        return NextResponse.json({ error: "Upload failed." }, { status: 500 });
    }
}
