export const environment = {
	develop_server: '10.147.18.108',
	production: false,
	Requerido: 'Campo requerido',
	application: {
		code: 'dev',
		version: '0.0.0',
		versionPrefix: '',
		header: '', //head title
	},
	frontend: {
		developerMode: true,
		applicationCode: '',
		baseUrl: 'http://localhost:4200'
	},
	backend: {
		host: "localhost:5108",
		baseApiUrl: 'http://localhost:5108/api',
		baseApiSecurityUrl: 'https://{host}/seguridadApi/api'
	},
	security: {
		externalProvider: false,
		issuer: '',
		redirectUri: '/.auth/callback',
		postLogoutRedirectUri: '/.auth/logout',
		silentRefreshRedirectUri: '/assets/silent-refresh.html',
		clientId: 'client.id',
		scope: 'openid profile email role client.id.resource'
	},
	mapbox: {
		accessToken: 'pk.eyJ1IjoiaHVnbzA5bnAiLCJhIjoiY21pMXdhMzhpMWVkcTJqb3FkanhkN3BqMyJ9.jU-LYk6hLrkk-iB01eUBFg' // Register at https://www.mapbox.com/ to get your token
	}
};
