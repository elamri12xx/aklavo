export default {
  async fetch(request) {
    const url = new URL(request.url);

    let id = "";

    if (url.pathname.startsWith("/files/cc/") && url.pathname.endsWith(".m3u8")) {
      id = url.pathname
        .replace("/files/cc/", "")
        .replace(".m3u8", "");
    }

    if (!id) {
      return new Response("Missing id", { status: 400 });
    }

    const res = await fetch(
      `http://look4k.com:80/live/0132221576/98324721/${id}.m3u8`,
      {
        redirect: "follow",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36"
        }
      }
    );

    const text = await res.text();

    const finalUrl = new URL(res.url);
    const base = finalUrl.origin;

    let playlist = text;

    try {
      const json = JSON.parse(text);
      if (json.data) playlist = json.data;
    } catch {}

    if (!playlist.startsWith("#EXTM3U")) {
      playlist = "#EXTM3U\n" + playlist;
    }

    const lines = playlist.split("\n");
    const out = [];

    for (const line of lines) {
      const l = line.trim();

      if (!l || l.startsWith("#")) {
        out.push(line);
      } else if (l.startsWith("http")) {
        out.push(l);
      } else {
        out.push(base + "/" + l.replace(/^\/+/, ""));
      }
    }

    return new Response(out.join("\n"), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
};
