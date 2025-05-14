const session = require("express-session");
const Keycloak = require("keycloak-connect");

exports.setUpKeycloak = () => {
  const memoryStore = new session.MemoryStore();
  const sessionConfig = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
  };
  const keycloakConfig = {
    realm: process.env.KEYCLOAK_REALM,
    authServerUrl: process.env.KEYCLOAK_AUTH_SERVER_URL,
    resource: process.env.KEYCLOAK_CLIENT_ID,
    bearerOnly: false,
    credentials: {
      secret: process.env.KEYCLOAK_CLIENT_SECRET,
    },
    ssl_required: "external",
    "confidential-port": 0,
  };
  return new Keycloak({ store: memoryStore }, keycloakConfig);
};
