/**
 * Starts the authentication flow
 */
const login = async () => {
    try {
        console.log("Logging in");        
        await auth0.loginWithRedirect();
    } catch (err) {
        console.log("Log in failed", err);
    }
};


/**
 * Retrieves the auth configuration from the server
 */
const fetchAuthConfig = () => fetch("auth_config.json");

/**
 * Initializes the Auth0 client
 */
const configureClient = async () => {
    const response = await fetchAuthConfig();
    const config = await response.json();

    auth0 = await createAuth0Client({
        domain: config.domain,
        client_id: config.clientId,
		audience: "https://serverx.glue42.com",
		redirect_uri:  window.location.origin,			
    });
};


const done = async () => {
    const user = await auth0.getUser();    
	const token = await auth0.getTokenSilently();
	console.log(token);
    // this will close the auth window
    glue42gd.authDone({ user: user.username, token });
};

// Will run when page finishes loading
window.onload = async () => {
    await configureClient();
    const isAuthenticated = await auth0.isAuthenticated();

    if (isAuthenticated) {
        done();
        return;
    }

    const query = window.location.search;
    const shouldParseResult = query.includes("code=") && query.includes("state=");

    if (shouldParseResult) {
        try {
            await auth0.handleRedirectCallback();
            done();
        } catch (err) {
            console.log("Error parsing redirect:", err);
        }
    } else {
        login();
    }
}
