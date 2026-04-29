export async function onRequest() {
  return new Response(
    JSON.stringify({ status: "ok", message: "function is working" }),
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      }
    }
  );
}
