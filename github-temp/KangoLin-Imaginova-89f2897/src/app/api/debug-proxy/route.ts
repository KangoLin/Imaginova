import { NextResponse } from "next/server";
import http from "node:http";
import tls from "node:tls";
import { URL } from "node:url";

export async function GET() {
  try {
    const proxyUrl = process.env.HTTPS_PROXY;
    const targetUrl = new URL("https://api.openai.com/v1/images/generations");

    if (!proxyUrl) {
      return NextResponse.json({ error: "No proxy configured" });
    }

    const proxy = new URL(proxyUrl);

    const result = await new Promise<{ status: number; body: string }>(
      (resolve, reject) => {
        const connectReq = http.request({
          hostname: proxy.hostname,
          port: parseInt(proxy.port) || 80,
          method: "CONNECT",
          path: targetUrl.hostname + ":443",
          timeout: 10000,
        });

        const timeout = setTimeout(() => {
          reject(new Error("Total timeout"));
        }, 30000);

        connectReq.on("connect", (res, socket) => {
          socket.setTimeout(20000);

          const tlsSocket = tls.connect(
            { socket, servername: targetUrl.hostname, timeout: 20000 },
            () => {
              const postBody = JSON.stringify({ model: "dall-e-3", prompt: "test", n: 1, size: "1024x1024" });
              const key = process.env.OPENAI_API_KEY || "";
              const req = "POST " + targetUrl.pathname + " HTTP/1.1\r\n" +
                "Content-Type: application/json\r\n" +
                "Authorization: Bearer " + key + "\r\n" +
                "Content-Length: " + Buffer.byteLength(postBody) + "\r\n" +
                "Host: " + targetUrl.hostname + "\r\n" +
                "Connection: close\r\n\r\n" +
                postBody;

              tlsSocket.write(req);
            }
          );

          let raw = "";
          tlsSocket.on("data", (c) => (raw += c.toString()));
          tlsSocket.on("end", () => {
            clearTimeout(timeout);
            const statusLine = raw.split("\r\n")[0];
            const statusCode = parseInt(statusLine.split(" ")[1]) || 500;
            resolve({ status: statusCode, body: raw.substring(0, 500) });
          });
          tlsSocket.on("error", (e) => {
            clearTimeout(timeout);
            reject(e);
          });
        });

        connectReq.on("error", (e) => {
          clearTimeout(timeout);
          reject(e);
        });
        connectReq.on("timeout", () => {
          clearTimeout(timeout);
          reject(new Error("CONNECT timeout"));
        });
        connectReq.end();
      }
    );

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
