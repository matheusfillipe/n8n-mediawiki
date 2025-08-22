import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class MediaWikiApi implements ICredentialType {
	name = 'mediaWikiApi';
	displayName = 'MediaWiki API';
	documentationUrl = 'https://www.mediawiki.org/wiki/API:Main_page';
	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: '',
			placeholder: 'https://en.wikipedia.org',
			description: 'Base URL of the MediaWiki instance',
			required: true,
		},
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			default: '',
			description: 'Username for MediaWiki authentication',
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Password for MediaWiki authentication',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			auth: {
				username: '={{$credentials.username}}',
				password: '={{$credentials.password}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/api.php',
			method: 'GET',
			qs: {
				action: 'query',
				meta: 'siteinfo',
				format: 'json',
			},
		},
	};
}