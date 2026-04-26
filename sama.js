export default {
  async fetch(request) {
    try {
      const url = new URL(request.url);
      const id = url.searchParams.get("id");

      if (!id) {
        return new Response("Missing id", { status: 400 });
      }

      const targetUrl =
        `http://look4k.com:80/live/0132221576/98324721/${id}.m3u8`;

      // CURL INIT + OPTIONS
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

      // CURL EXEC RESPONSE
      const responseText = await res.text();

      // EFFECTIVE URL (like curl_getinfo)
      const finalUrl = res.url;
      const parts = new URL(finalUrl);

      let base = parts.protocol + "//" + parts.hostname;
      if (parts.port) base += ":" + parts.port;

      // json_decode($response, true)
      let playlist = responseText;

      try {
        const json = JSON.parse(responseText);
        if (json && json.data) {
          playlist = json.data;
        }
      } catch (e) {
        // fallback raw response
      }

      playlist = playlist.trim();

      if (!playlist.startsWith("#EXTM3U")) {
        playlist = "#EXTM3U\n" + playlist;
      }

      // preg_replace_callback equivalent
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
      return new Response("Error: " + err.message, { status: 500 });
    }
  }
};
