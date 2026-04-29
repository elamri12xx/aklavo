addEventListener("fetch", event => {
  event.respondWith(handle(event.request));
});

async function handle(request) {
  try {
    const urlObj = new URL(request.url);
    const targetUrl = urlObj.searchParams.get("url");

    if (!targetUrl) {
      return json({ error: "missing url" }, 400);
    }

    const apiUrl =
      "https://token.easybroadcast.io/all?url=" +
      encodeURIComponent(targetUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json,text/javascript,*/*;q=0.01",
        "Referer": "https://snrtlive.ma/"
      }
    });

    const text = await response.text();

    if (!response.ok) {
      return json({
        error: "failed to get token",
        detail: text
      }, 502);
    }

    const data = new URLSearchParams(text);

    const token = data.get("token") || "";
    const tokenPath = data.get("token_path") || "";
    const expires = data.get("expires") || "";

    if (token || tokenPath || expires) {
      return new Response(
        `token=${token}&token_path=${encodeURIComponent(tokenPath)}&expires=${expires}`,
        {
          status: 200,
          headers: {
            "Content-Type": "text/plain; charset=utf-8"
          }
        }
      );
    }

    return json({ raw_response: text }, 200);

  } catch (error) {
    return json({
      error: "internal server error",
      detail: error.message
    }, 500);
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}
