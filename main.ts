import { serveDir } from "jsr:@std/http/file-server";

const fsRoot = "public";
const options = {
  port: 8080, // 변경된 포트
  hostname: "localhost",
  onListen: () => console.log("Listening on http://localhost:8080"),
};

Deno.serve(options, (r) => serveDir(r, { fsRoot }));
