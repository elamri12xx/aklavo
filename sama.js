export default {
  async fetch(request) {
    try {
      const url = new URL(request.url);
      const path = url.pathname;

      let id = "";

      if (path.startsWith("/files/cc/") && path.endsWith(".m3u8")) {
        id = path
          .replace("/files/cc/", "")
          .replace(".m3u8", "")
          .trim();
      }

      if (!id) {
        return new Response("Missing id", { status: 400 });
      }

      const targetUrl =
        `http://look4k.com:80/live/0132221576/98324721/${id}.m3u8`;

      const res = await fetch(targetUrl, {
        redirect: "follow",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36"
        }
      });

      if (!res.ok) {
        return new Response("Upstream request failed", { status: 502 });
      }

      const responseText = await res.text();
      const finalUrl = res.url;

      const finalParsed = new URL(finalUrl);
      const base = finalParsed.origin;

      let playlist = responseText.trim();

      try {
        const json = JSON.parse(responseText);
        if (json.data) {
          playlist = String(json.data).trim();
        }
      } catch (e) {}

      if (!playlist.startsWith("#EXTM3U")) {
        playlist = "#EXTM3U\n" + playlist;
      }

      const lines = playlist.split(/\r?\n/);
      const output = [];

      for (const line of lines) {
        const trim = line.trim();

        if (!trim || trim.startsWith("#")) {
          output.push(line);
          continue;
        }

        if (
          trim.startsWith("http://") ||
          trim.startsWith("https://")
        ) {
          output.push(trim);
          continue;
        }

        output.push(base + "/" + trim.replace(/^\/+/, ""));
      }

      return new Response(output.join("\n"), {
        headers: {
          "Content-Type": "application/vnd.apple.mpegurl; charset=utf-8",
          "Access-Control-Allow-Origin": "*"
        }
      });

    } catch (err) {
      return new Response("Error: " + err.message, { status: 500 });
    }
  }
};
