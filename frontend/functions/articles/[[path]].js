/**
 * Cloudflare Pages Function
 * Path: frontend/functions/articles/[[path]].js
 *
 * Forwards  https://medmaxpub.com/articles/<slug>.pdf
 * to        https://medmaxpub-production.up.railway.app/articles/<slug>.pdf
 *
 * The visitor never leaves medmaxpub.com — the PDF is streamed back
 * through Cloudflare, so the address bar keeps your own domain.
 */

const BACKEND_ORIGIN = "https://medmaxpub.onrender.com";

export async function onRequest(context) {
  const { request, params } = context;

  const segments = Array.isArray(params.path) ? params.path : [params.path];
  const subPath = segments.filter(Boolean).join("/");

  // Anything that isn't a PDF request is not ours — let Pages handle it
  if (!subPath.toLowerCase().endsWith(".pdf")) {
    return context.next();
  }

  const incoming = new URL(request.url);
  const targetUrl = `${BACKEND_ORIGIN}/articles/${subPath}${incoming.search}`;

  const upstream = await fetch(targetUrl, {
    method: "GET",
    headers: {
      Accept: request.headers.get("Accept") || "application/pdf",
      "User-Agent": request.headers.get("User-Agent") || "cloudflare-pages"
    },
    redirect: "follow"
  });

  if (!upstream.ok) {
    return new Response("PDF not found", { status: upstream.status });
  }

  const headers = new Headers();
  headers.set("Content-Type", upstream.headers.get("Content-Type") || "application/pdf");
  headers.set("Content-Disposition", upstream.headers.get("Content-Disposition") || "inline");
  headers.set("Cache-Control", "public, max-age=3600");

  const contentLength = upstream.headers.get("Content-Length");
  if (contentLength) headers.set("Content-Length", contentLength);

  return new Response(upstream.body, { status: 200, headers });
}
