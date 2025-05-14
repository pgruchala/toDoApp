const { setUpKeycloak } = require('../config/keycloak');

exports.keycloakProtect = (role) => {
  const keycloak = setUpKeycloak();
  
  if (role) {
    return keycloak.protect(`realm:${role}`);
  }
  
  return keycloak.protect();
};