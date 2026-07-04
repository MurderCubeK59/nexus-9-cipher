export default {
  async fetch(request, env) {

    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    const url = new URL(request.url);

    const PASSWORD = "nexus9";
    const sessions = globalThis.sessions || (globalThis.sessions = {});

    if (url.pathname === "/login") {
      const { pass } = await request.json();

      if (pass !== PASSWORD) {
        return Response.json({ ok:false }, { headers });
      }

      const token = crypto.randomUUID();
      sessions[token] = Date.now();

      return Response.json({ ok:true, token }, { headers });
    }

    if (url.pathname === "/verify") {
      const { token } = await request.json();

      const time = sessions[token];

      if (!time) {
        return Response.json({ ok:false }, { headers });
      }

      if (Date.now() - time > 600000) {
        delete sessions[token];
        return Response.json({ ok:false, expired:true }, { headers });
      }

      return Response.json({ ok:true }, { headers });
    }

    return new Response("NEXUS-9 ONLINE", { headers });
  }
};
