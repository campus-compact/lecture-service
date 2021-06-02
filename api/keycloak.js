import Keycloak from 'keycloak-connect'
import session from 'express-session'

var memoryStore = new session.MemoryStore();
var keycloak = new Keycloak({store: memoryStore});

export default keycloak