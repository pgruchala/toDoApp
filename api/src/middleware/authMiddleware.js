const { setUpKeycloak } = require('../config/keycloak');

exports.keycloakProtect = (role) => {
  const keycloak = setUpKeycloak();
  
  if (role) {
    return keycloak.protect(`realm:${role}`);
  }
  
  return keycloak.protect();
};

exports.extractUserInfo = (req, res, next) => {
  try {
    if (req.kauth && req.kauth.grant && req.kauth.grant.access_token) {
      const token = req.kauth.grant.access_token;
      const content = token.content;
      
      req.user = {
        keycloakId: content.sub,
        email: content.email,
        role: content.realm_access?.roles || [],
        userId: content.sub,
        firstName: content.given_name,
        lastName: content.family_name,
        username: content.preferred_username
      };
      
      req.headers['x-user-id'] = content.sub;
      req.headers['x-user-email'] = content.email;
      req.headers['x-user-role'] = content.realm_access?.roles?.join(',') || 'user';
      
      next();
    } else {
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized - Invalid token" 
      });
    }
  } catch (error) {
    console.error('Error extracting user info:', error);
    next(error);
  }
};

exports.authenticateAndExtract = (role) => {
  const keycloak = setUpKeycloak();
  const protectMiddleware = role ? keycloak.protect(`realm:${role}`) : keycloak.protect();
  
  return [protectMiddleware, exports.extractUserInfo];
};

exports.microserviceAuth = async (req, res, next) => {
  try {
    const keycloakId = req.headers["x-user-id"];
    const email = req.headers["x-user-email"];
    const role = req.headers["x-user-role"];
    
    if (!keycloakId) {
      return res
        .status(401)
        .json({ 
          success: false,
          message: "Unauthorized - User ID missing" 
        });
    }

    req.user = {
      keycloakId,
      email,
      role: role ? role.split(',') : ['user'],
      userId: keycloakId
    };
    
    next();
  } catch (error) {  
    next(error);
  }
};