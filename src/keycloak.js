import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
    url: "http://10.2.0.10:9001/",
    realm: "NerdHub",
    clientId: "NerdHubClient"
});

export default keycloak;