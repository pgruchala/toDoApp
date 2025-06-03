const session = require("express-session");
const Keycloak = require("keycloak-connect");

exports.setUpKeycloak = () => {
  const memoryStore = new session.MemoryStore();
  const keycloakConfig = {
    realm: process.env.KEYCLOAK_REALM,
    authServerUrl:
      process.env.KEYCLOAK_PUBLIC_URL || process.env.KEYCLOAK_AUTH_SERVER_URL,
    resource: process.env.KEYCLOAK_CLIENT_ID,
    bearerOnly: false,
    credentials: {
      secret: process.env.KEYCLOAK_CLIENT_SECRET,
    },
    ssl_required: "none",
    "confidential-port": 0,
  };
  const keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);

  keycloak.accessDenied = (req, res) => {
    res.status(403).json({
      success: false,
      message: "Access denied - insufficient permissions",
    });
  };

  return keycloak;
};
