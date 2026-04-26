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
        "User-Agent": "Mozilla/5.0"
      }
    });

    const finalUrl = res.url;
    const text = await res.text();

    const base = finalUrl.substring(0, finalUrl.lastIndexOf("/") + 1);

    const lines = text.split("\n");
    const output = [];

    for (const line of lines) {
      const l = line.trim();

      if (!l) {
        output.push("");
        continue;
      }

      if (l.startsWith("#")) {
        output.push(l);
        continue;
      }

      if (l.startsWith("http")) {
        output.push(l);
      } else {
        output.push(base + l.replace(/^\/+/, ""));
      }
    }

    let playlist = output.join("\n");

    if (!playlist.startsWith("#EXTM3U")) {
      playlist = "#EXTM3U\n" + playlist;
    }

    return new Response(playlist, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
