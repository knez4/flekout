/* Flekout: Cloudflare Worker ispred statičnih fajlova iz dist/.
   Jedini posao: video (.mp4) služi u delovima (HTTP 206 na zahtev "Range").
   Safari na iPhone-u video pušta samo ako server to podržava, a statični
   fajlovi na Workers-u uvek vraćaju ceo fajl. Sve ostalo ide pravo iz dist/. */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const asset = await env.ASSETS.fetch(new Request(url, { method: 'GET' }));
    if (!url.pathname.endsWith('.mp4') || asset.status !== 200) return asset;

    const headers = new Headers(asset.headers);
    headers.set('Accept-Ranges', 'bytes');
    const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get('Range') || '');
    if (!range) {
      return new Response(request.method === 'HEAD' ? null : asset.body, { status: 200, headers });
    }

    const body = await asset.arrayBuffer();
    const size = body.byteLength;
    let start, end;
    if (range[1] === '') { start = Math.max(0, size - Number(range[2])); end = size - 1; }
    else { start = Number(range[1]); end = range[2] === '' ? size - 1 : Math.min(Number(range[2]), size - 1); }
    if (start >= size || start > end) {
      return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
    }
    headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
    headers.set('Content-Length', String(end - start + 1));
    return new Response(request.method === 'HEAD' ? null : body.slice(start, end + 1), { status: 206, headers });
  }
};
