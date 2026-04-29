addEventListener("fetch", event => {
  event.respondWith(handle(event.request));
});

async function handle(request) {
  try {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get("url");

    if (!targetUrl) {
      return json({ error: "missing url" }, 400);
    }

    const apiUrl = `${API_BASE}?url=${encodeURIComponent(targetUrl)}`;

    const res = await fetch(apiUrl, {
      headers: {
        "Accept": "application/json,text/javascript,*/*;q=0.01",
        "Referer": "https://snrtlive.ma/"
      }
    });

    const text = await res.text();

    const data = new URLSearchParams(text);

    return new Response(
      `token=${data.get("token") || ""}&token_path=${encodeURIComponent(data.get("token_path") || "")}&expires=${data.get("expires") || ""}`,
      {
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      }
    );

  } catch (e) {
    return json({ error: "internal error" }, 500);
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
                 }
