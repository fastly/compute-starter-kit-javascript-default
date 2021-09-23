// The entry point for your application.
//
// Use this fetch event listener to define your main request handling logic. It could be
// used to route based on the request properties (such as method or path), send
// the request to a backend, make completely new requests, and/or generate
// synthetic responses.
addEventListener('fetch', event => event.respondWith(handleRequest(event)));

// The name of a backend server associated with this service.
//
// This should be changed to match the name of your own backend. See the
// `Hosts` section of the Fastly Wasm service UI for more information.
const BACKEND_NAME = "backend_name";

/// The name of a second backend associated with this service.
const OTHER_BACKEND_NAME = "other_backend_name";

async function handleRequest(event) {

  // Send logs to your custom logging endpoint
  // https://developer.fastly.com/learning/compute/javascript/#logging
  // const logger = fastly.getLogger("my-logging-endpoint-name");
  // logger.log("log message");

  // Get the client request from the event
  let req = event.request;

  // Make any desired changes to the client request.
  req.headers.set("Host", "example.com");

  // We can filter requests that have unexpected methods.
  const VALID_METHODS = ["GET"];
  if (!VALID_METHODS.includes(req.method)) {
    let response = new Response("This method is not allowed", {
      status: 405
    });

    // Send the response back to the client.
    return response;
  }

  let method = req.method;
  let url = new URL(event.request.url);

  // If request is a `GET` to the `/` path, send a default response.
  if (method == "GET" && url.pathname == "/") {
    let headers = new Headers();
    headers.set('Content-Type', 'text/html; charset=utf-8');
    let response = new Response("<iframe src='https://developer.fastly.com/compute-welcome' style='border:0; position: absolute; top: 0; left: 0; width: 100%; height: 100%'></iframe>\n", {
      status: 200,
      headers
    });

    // Send the response back to the client.
    return response;
  }

  // If request is a `GET` to the `/backend` path, send to a named backend.
  if (method == "GET" && url.pathname == "/backend") {
    // Request handling logic could go here...
    // E.g., send the request to an origin backend and then cache the
    // response for one minute.
    let cacheOverride = new CacheOverride("override", { ttl:60 });
    return fetch(req, {
      backend: BACKEND_NAME,
      cacheOverride,
    });
  }

  // If request is a `GET` to a path starting with `/other/`.
  if (method == "GET" && url.pathname.startsWith("/other/")) {
    // Send request to a different backend and don't cache response.
    let cacheOverride = new CacheOverride("pass");
    return fetch(req, {
      backend: OTHER_BACKEND_NAME,
      cacheOverride,
    });
  }

  // Catch all other requests and return a 404.
  let response = new Response("The page you requested could not be found", {
    status: 404
  });

  // Send the response back to the client.
  return response;
};
