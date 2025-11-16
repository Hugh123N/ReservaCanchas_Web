export const environment = {
	develop_server: '10.147.18.108',
	production: false,
	Requerido: 'Campo requerido',
	application: {
		code: '',
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
		host: "10.147.18.108:9090",
		baseApiUrl: 'http://10.147.18.108:9090/api',
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
	email: 'user@email.com',
	password: 'password$',
	mapbox: {
		accessToken: 'pk.eyJ1IjoiaHVnbzA5bnAiLCJhIjoiY21pMThzNTV2MTgxMzJucTBrZmE0ZndkZiJ9.kgmswkk3XqpmrfFxyvsaRA' // Register at https://www.mapbox.com/ to get your token
	}
};
