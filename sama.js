export default {
  async fetch(request) {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new Response("Missing id", { status: 400 });
    }

    const source =
      `https://kadar.reda-stream.eu.org/live/d49dc02ec79b/k5cfhnm1/${id}.m3u8`;

    const res = await fetch(source, {
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36",
        "Referer": "https://reda-stream.eu.org/",
        "Origin": "https://reda-stream.eu.org"
      }
    });

    const text = await res.text();
    const lines = text.split("\n");

    let streamUrl = "";

    for (const line of lines) {
      let l = line.trim();

      if (!l || l.startsWith("#")) continue;

      // حذف error code
      if (l.includes("/error code")) {
        l = l.split("/error code")[0].trim();
      }

      if (!l.startsWith("http")) continue;

      // إضافة id بالنهاية إذا غير موجود
      if (!l.endsWith("/" + id)) {
        l = l.replace(/\/+$/, "") + "/" + id;
      }

      streamUrl = l;
      break;
    }

    if (!streamUrl) {
      return new Response("Stream not found", { status: 404 });
    }

    return new Response(streamUrl, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store"
      }
    });
  }
}
