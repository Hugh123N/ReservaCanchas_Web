export const environment = {
	production: false,
	Requerido: 'Campo requerido',
	application: {
		code: '',
		version: '0.0.0',
		versionPrefix: '',
		header: '', //head title
	},
	frontend: {
		developerMode: false,
		applicationCode: '',
		baseUrl: 'http://localhost:4200'
	},
	backend: {
		baseApiUrl: '',
    baseApiSecurityUrl: ''
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
	password: 'password$'
};
