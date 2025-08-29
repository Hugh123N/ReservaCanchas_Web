export const environment = {
	develop_server: '10.147.18.108', 
	production: true,
	variableepesajeText: 'Reserva',
	Requerido:'Campo requerido',
	application: {
		code: 'pesaje',
		version: '0.0.1',
		versionPrefix: '',
		header: 'Reserva',
	},
	frontend: {
		developerMode: false,
		applicationCode: '',
		baseUrl: 'http://localhost:4200'
	},
	backend: {
		baseApiUrl: 'https://{host}/api',
	},
	security: {
		externalProvider: false,
		//Set this configuration if there is an external security provider
		issuer: '',
		redirectUri: '/.auth/callback',
		postLogoutRedirectUri: '/.auth/logout',
		silentRefreshRedirectUri: '/assets/silent-refresh.html',
		clientId: 'client.id',
		scope: 'openid profile email role client.id.resource'
	},
	USER: 'system@administrator',
	PASSWORD: 'Creative2023$'
};
