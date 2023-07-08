import { Readable } from "stream";

export default async function streamToBuffer(
  readableStream: Readable
): Promise<Buffer[]> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    readableStream.on("data", (data: Buffer | string) => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data));
    });
    readableStream.on("end", () => {
      resolve(chunks);
    });
    readableStream.on("error", reject);
  });
}
