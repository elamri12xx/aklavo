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

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(targetUrl, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Accept": "*/*",
          "Connection": "keep-alive"
        }
      });

      clearTimeout(timeout);

      if (!res.ok) {
        return new Response("Upstream status: " + res.status, {
          status: 502
        });
      }

      const responseText = await res.text();
      const finalUrl = res.url;

      const parsed = new URL(finalUrl);
      const base = parsed.origin;

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
        } else {
          output.push(base + "/" + trim.replace(/^\/+/, ""));
        }
      }

      return new Response(output.join("\n"), {
        headers: {
          "Content-Type":
            "application/vnd.apple.mpegurl; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-store"
        }
      });

    } catch (err) {
      return new Response("Error: " + err.message, {
        status: 500
      });
    }
  }
};
