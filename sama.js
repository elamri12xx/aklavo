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

    const finalUrl = res.url;
    const text = await res.text();

    const base = finalUrl.substring(0, finalUrl.lastIndexOf("/") + 1);

    const lines = text.split("\n");
    const output = [];

    for (const line of lines) {
      let l = line.trim();

      if (!l) {
        output.push("");
        continue;
      }

      if (l.startsWith("#")) {
        output.push(l);
        continue;
      }

      // حذف error code إذا موجود
      if (l.includes("/error code")) {
        l = l.split("/error code")[0].trim();
      }

      // تجاهل أي سطر أصبح فارغ
      if (!l) continue;

      // إذا رابط مباشر
      if (l.startsWith("http")) {
        output.push(l);
      } else {
        // تحويل النسبي إلى مطلق
        output.push(base + l.replace(/^\/+/, ""));
      }
    }

    let playlist = output.join("\n");

    // إضافة EXTM3U إذا ناقصة
    if (!playlist.startsWith("#EXTM3U")) {
      playlist = "#EXTM3U\n" + playlist;
    }

    return new Response(playlist, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store"
      }
    });
  }
}
