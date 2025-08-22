export interface MediaWikiCredentials {
	baseUrl?: string;
	username?: string;
	password?: string;
}

export interface PageGetOptions {
	title: string;
}

export interface PageEditOptions {
	title: string;
	content: string;
	summary?: string;
}

export interface SearchOptions {
	query: string;
	limit?: number;
}

export interface RequestHelper {
	request(options: any): Promise<any>;
}

export class MediaWikiClient {
	private baseUrl: string;
	private requestHelper: RequestHelper;

	constructor(credentials: MediaWikiCredentials | undefined, requestHelper: RequestHelper) {
		const rawBaseUrl = credentials?.baseUrl || 'https://en.wikipedia.org';
		// Normalize the base URL and handle cases where api.php is already included
		if (rawBaseUrl.endsWith('/api.php')) {
			// If the base URL already includes api.php, use it as-is but remove trailing slashes
			this.baseUrl = rawBaseUrl.replace(/\/+$/, '');
		} else {
			// If the base URL doesn't include api.php, remove trailing slashes
			this.baseUrl = rawBaseUrl.replace(/\/+$/, '');
		}
		this.requestHelper = requestHelper;
	}

	private getApiUrl(): string {
		// If baseUrl already ends with api.php, return it as-is
		if (this.baseUrl.endsWith('/api.php')) {
			return this.baseUrl;
		}
		// Otherwise, append /api.php
		return `${this.baseUrl}/api.php`;
	}

	// Helper method for debugging URL construction
	getDebugInfo(): { baseUrl: string; apiUrl: string } {
		return {
			baseUrl: this.baseUrl,
			apiUrl: this.getApiUrl(),
		};
	}

	// Alternative URL construction method (now just uses main getApiUrl)
	private getApiUrlAlternative(): string {
		return this.getApiUrl();
	}

	async getPage(options: PageGetOptions): Promise<any> {
		return this.requestHelper.request({
			method: 'GET',
			baseURL: this.baseUrl,
			url: '/api.php',
			qs: {
				action: 'query',
				prop: 'revisions',
				titles: options.title,
				rvprop: 'content',
				format: 'json',
			},
			json: true,
		});
	}

	async editPage(options: PageEditOptions): Promise<any> {
		// First, we need to get a proper CSRF token for authenticated requests
		let token = '+\\'; // Anonymous token
		
		try {
			// Try to get a CSRF token for authenticated editing
			const requestOptions = {
				method: 'GET',
				url: this.getApiUrlAlternative(),
				qs: {
					action: 'query',
					meta: 'tokens',
					format: 'json',
				},
				json: true,
			};
			
			const tokenResponse = await this.requestHelper.request(requestOptions);
			
			if (tokenResponse && tokenResponse.query && tokenResponse.query.tokens && tokenResponse.query.tokens.csrftoken) {
				token = tokenResponse.query.tokens.csrftoken;
			}
		} catch (error) {
			// If we can't get a token, continue with anonymous token
			console.warn('Could not retrieve CSRF token, using anonymous token');
		}

		const formData: any = {
			action: 'edit',
			title: options.title,
			text: options.content,
			format: 'json',
			token: token,
		};

		if (options.summary) {
			formData.summary = options.summary;
		}

		const editRequestOptions = {
			method: 'POST',
			url: this.getApiUrlAlternative(),
			form: formData,
			json: true,
		};
		
		return this.requestHelper.request(editRequestOptions);
	}

	async searchPages(options: SearchOptions): Promise<any> {
		return this.requestHelper.request({
			method: 'GET',
			baseURL: this.baseUrl,
			url: '/api.php',
			qs: {
				action: 'query',
				list: 'search',
				srsearch: options.query,
				srlimit: Math.min(options.limit || 10, 500),
				format: 'json',
			},
			json: true,
		});
	}

	async getSiteInfo(): Promise<any> {
		return this.requestHelper.request({
			method: 'GET',
			baseURL: this.baseUrl,
			url: '/api.php',
			qs: {
				action: 'query',
				meta: 'siteinfo',
				format: 'json',
			},
			json: true,
		});
	}
}