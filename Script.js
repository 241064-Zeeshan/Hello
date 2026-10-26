
export async function onRequest({ request, env, next }) {
    const auth = request.headers.get("Authorization");

    if (!auth || !auth.startsWith("Basic ")) {
        return loginRequired();
    }

    let credentials;

    try {
        credentials = atob(auth.slice(6));
    } catch {
        return loginRequired();
    }

    const separator = credentials.indexOf(":");

    if (separator < 0) {
        return loginRequired();
    }

    const username = credentials.slice(0, separator);
    const password = credentials.slice(separator + 1);

    const roles = {
        role1: env.ROLE1_PASSWORD,
        role2: env.ROLE2_PASSWORD,
        role3: env.ROLE3_PASSWORD
    };

    if (!roles[username] || !password || password !== roles[username]) {
        return loginRequired();
    }

    const response = await next();
    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "no-store");

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
    });
}

function loginRequired() {
    return new Response("Access denied. Enter a valid role and password.", {
        status: 401,
        headers: {
            "WWW-Authenticate": 'Basic realm="Hello Team", charset="UTF-8"',
            "Cache-Control": "no-store"
        }
    });
}
