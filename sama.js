export default {
  async fetch(request) {
    try {
      const url = new URL(request.url);
      const path = url.pathname;

      let id = "";

      // نفس $_GET['id']
      if (path.startsWith("/files/cc/") && path.endsWith(".m3u8")) {
        id = path.replace("/files/cc/", "").replace(".m3u8", "");
      }

      if (!id) {
        return new Response("Missing id", { status: 400 });
      }

      const targetUrl =
        `http://bouygues-cdn.r1v.us:8080/live/d49dc02ec79b/k5cfhnm1/${id}.m3u8`;

      // نفس cURL
      const res = await fetch(targetUrl, {
        method: "GET",
        redirect: "follow",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        }
      });

      if (!res) {
        return new Response("Request failed", { status: 500 });
      }

      const responseText = await res.text();

      // نفس CURL_EFFECTIVE_URL
      const finalUrl = res.url;
      const parsed = new URL(finalUrl);

      let base = parsed.protocol + "//" + parsed.hostname;
      if (parsed.port) {
        base += ":" + parsed.port;
      }

      // نفس json decode
      let playlist = responseText.trim();

      try {
        const json = JSON.parse(responseText);
        if (json.data) {
          playlist = json.data.trim();
        }
      } catch (e) {}

      // نفس EXT check
      if (!playlist.startsWith("#EXTM3U")) {
        playlist = "#EXTM3U\n" + playlist;
      }

      // نفس preg_replace_callback
      const lines = playlist.split(/\r?\n/);
      const out = [];

      for (let line of lines) {
        let l = line.trim();

        if (l === "") {
          out.push(l);
          continue;
        }

        if (l.startsWith("#")) {
          out.push(l);
          continue;
        }

        if (l.startsWith("http://") || l.startsWith("https://")) {
          out.push(l);
          continue;
        }

        if (l.startsWith("/") || !l.includes("://")) {
          out.push(base + "/" + l.replace(/^\/+/, ""));
          continue;
        }

        out.push(l);
      }

      return new Response(out.join("\n"), {
        headers: {
          "Content-Type": "text/plain; charset=utf-8"
        }
      });

    } catch (err) {
      return new Response(err.message, { status: 500 });
    }
  }
};
