addEventListener("fetch", event => {
  event.respondWith(handle(event.request));
});

async function handle(request) {
  return new Response(
    JSON.stringify({ status: "ok", message: "worker is working" }),
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
}
