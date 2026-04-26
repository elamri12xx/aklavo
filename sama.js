export default {
  async fetch(request) {
    const urlObj = new URL(request.url);
    const id = urlObj.searchParams.get("id");

    if (!id) {
      return new Response("Missing id", { status: 400 });
    }

    const targetUrl = `https://kadar.reda-stream.eu.org/live/d49dc02ec79b/k5cfhnm1/${id}.m3u8`;

    const response = await fetch(targetUrl, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "application/vnd.apple.mpegurl, application/x-mpegURL, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site",
        "Referer": "https://google.com/"
      }
    });

    if (!response.ok) {
      return new Response(
        `Origin Error: ${response.status}`,
        { status: response.status }
      );
    }

    const finalUrl = response.url;
    const parsed = new URL(finalUrl);

    let base = `${parsed.protocol}//${parsed.hostname}`;
    if (parsed.port) base += `:${parsed.port}`;

    let playlist = await response.text();

    // دعم JSON لو موجود
    try {
      const json = JSON.parse(playlist);
      if (json?.data) playlist = json.data;
    } catch (e) {}

    playlist = playlist.trim();

    if (!playlist.startsWith("#EXTM3U")) {
      playlist = "#EXTM3U\n" + playlist;
    }

    playlist = playlist.replace(/^(?!#)(.+)$/gm, (line) => {
      line = line.trim();

      if (!line) return line;

      if (
        line.startsWith("http://") ||
        line.startsWith("https://")
      ) {
        return line;
      }

      return base + "/" + line.replace(/^\/+/, "");
    });

    return new Response(playlist, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store"
      }
    });
  }
};
