import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	NodeConnectionType,
} from 'n8n-workflow';

import { MediaWikiClient } from '../../src/MediaWikiClient';

export class MediaWiki implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'MediaWiki',
		name: 'mediaWiki',
		icon: 'file:mediawiki.svg',
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with MediaWiki instances',
		defaults: {
			name: 'MediaWiki',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'mediaWikiApi',
				required: false,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Page',
						value: 'page',
					},
					{
						name: 'Search',
						value: 'search',
					},
				],
				default: 'page',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['page'],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get a page',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new page',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an existing page',
					},
				],
				default: 'get',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['search'],
					},
				},
				options: [
					{
						name: 'Search',
						value: 'search',
						description: 'Search for pages',
					},
				],
				default: 'search',
			},
			{
				displayName: 'Page Title',
				name: 'pageTitle',
				type: 'string',
				default: '',
				placeholder: 'Main Page',
				description: 'Title of the page',
				displayOptions: {
					show: {
						resource: ['page'],
						operation: ['get', 'create', 'update'],
					},
				},
				required: true,
			},
			{
				displayName: 'Content',
				name: 'content',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Content of the page',
				displayOptions: {
					show: {
						resource: ['page'],
						operation: ['create', 'update'],
					},
				},
				required: true,
			},
			{
				displayName: 'Search Query',
				name: 'searchQuery',
				type: 'string',
				default: '',
				placeholder: 'Wikipedia',
				displayOptions: {
					show: {
						resource: ['search'],
						operation: ['search'],
					},
				},
				required: true,
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 500,
				},
				default: 10,
				description: 'Max number of results to return',
				displayOptions: {
					show: {
						resource: ['search'],
						operation: ['search'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('mediaWikiApi');

		const client = new MediaWikiClient(credentials, this.helpers);

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				let responseData;

				if (resource === 'page') {
					const pageTitle = this.getNodeParameter('pageTitle', i) as string;

					if (operation === 'get') {
						responseData = await client.getPage({ title: pageTitle });
					} else if (operation === 'create' || operation === 'update') {
						const content = this.getNodeParameter('content', i) as string;
						responseData = await client.editPage({ title: pageTitle, content });
					}
				} else if (resource === 'search') {
					if (operation === 'search') {
						const searchQuery = this.getNodeParameter('searchQuery', i) as string;
						const limit = this.getNodeParameter('limit', i) as number;
						responseData = await client.searchPages({ query: searchQuery, limit });
					}
				}

				returnData.push({
					json: responseData,
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error instanceof Error ? error.message : String(error),
						},
					});
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error);
			}
		}

		return [returnData];
	}
}