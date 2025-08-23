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
			description: 'Full base URL of the MediaWiki instance including protocol. Examples: https://en.wikipedia.org, https://wiki.company.com, http://localhost/mediawiki.',
			required: true,
		},
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			default: '',
			description: 'MediaWiki username for authenticated operations (editing, deleting). Leave empty for read-only anonymous access.',
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'MediaWiki password or bot password for authenticated operations. Required for creating, editing, or deleting pages.',
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