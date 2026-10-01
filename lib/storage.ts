import {
	CreateBucketCommand,
	DeleteObjectCommand,
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const bucket = process.env.S3_BUCKET ?? "agenteterra-properties";
const client = new S3Client({
	region: process.env.S3_REGION ?? "us-east-1",
	endpoint: process.env.S3_ENDPOINT ?? "http://localhost:9000",
	forcePathStyle: true,
	credentials: {
		accessKeyId: process.env.S3_ACCESS_KEY ?? "minioadmin",
		secretAccessKey: process.env.S3_SECRET_KEY ?? "minioadmin",
	},
});

async function ensureBucket() {
	try {
		await client.send(new CreateBucketCommand({ Bucket: bucket }));
	} catch (error) {
		const code = (error as { name?: string }).name;
		if (code !== "BucketAlreadyOwnedByYou" && code !== "BucketAlreadyExists")
			throw error;
	}
}

export async function uploadPropertyImage(
	key: string,
	body: Uint8Array,
	contentType: string,
) {
	await ensureBucket();
	await client.send(
		new PutObjectCommand({
			Bucket: bucket,
			Key: key,
			Body: body,
			ContentType: contentType,
		}),
	);
}

export async function getPropertyImageUrl(key: string) {
	return getSignedUrl(
		client,
		new GetObjectCommand({ Bucket: bucket, Key: key }),
		{ expiresIn: 60 * 60 },
	);
}

export async function deletePropertyImage(key: string) {
	await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
