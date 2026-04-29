export async function onRequest(context) {
  try {
    const { request } = context;
    const urlObj = new URL(request.url);
    const targetUrl = urlObj.searchParams.get("url");

    if (!targetUrl) {
      return new Response(
        JSON.stringify({ error: "missing url" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json; charset=utf-8"
          }
        }
      );
    }

    const apiUrl =
      "https://token.easybroadcast.io/all?url=" +
      encodeURIComponent(targetUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Referer": "https://snrtlive.ma/",
        "Accept": "application/json,text/javascript,*/*;q=0.01"
      }
    });

    const text = await response.text();

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: "failed to get token",
          detail: text
        }),
        {
          status: 502,
          headers: {
            "Content-Type": "application/json; charset=utf-8"
          }
        }
      );
    }

    const data = new URLSearchParams(text);

    if ([...data.keys()].length > 0) {
      const token = data.get("token") || "";
      const tokenPath = data.get("token_path") || "";
      const expires = data.get("expires") || "";

      const cleanResponse =
        `token=${token}` +
        `&token_path=${encodeURIComponent(tokenPath)}` +
        `&expires=${expires}`;

      return new Response(cleanResponse, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8"
        }
      });
    }

    return new Response(
      JSON.stringify({ raw_response: text }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "internal server error",
        detail: error.message
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        }
      }
    );
  }
}
