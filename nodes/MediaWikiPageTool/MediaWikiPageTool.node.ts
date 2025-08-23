import {
	ISupplyDataFunctions,
	INodeType,
	INodeTypeDescription,
	SupplyData,
	NodeConnectionType,
} from 'n8n-workflow';

import { DynamicTool } from '@langchain/core/tools';
import { MediaWikiClient } from '../../src/MediaWikiClient';

export class MediaWikiPageTool implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'MediaWiki Page Tool',
		name: 'mediaWikiPageTool',
		icon: 'file:mediawiki.svg',
		group: ['transform'],
		version: 1,
		description: 'AI tool for MediaWiki page operations (get, create, update)',
		usableAsTool: true,
		defaults: {
			name: 'MediaWiki Page Tool',
		},
		codex: {
			categories: ['AI'],
			subcategories: {
				AI: ['Tools'],
			},
			resources: {
				primaryDocumentation: [
					{
						url: 'https://www.mediawiki.org/wiki/API:Main_page',
					},
				],
			},
		},
		inputs: [],
		outputs: [{ type: NodeConnectionType.AiTool }],
		outputNames: ['tool'],
		credentials: [
			{
				name: 'mediaWikiApi',
				required: false,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Get',
						value: 'get',
					},
					{
						name: 'Create',
						value: 'create',
					},
					{
						name: 'Update',
						value: 'update',
					},
				],
				default: 'get',
				required: false,
			},
			{
				displayName: 'Page Title',
				name: 'pageTitle',
				type: 'string',
				default: '',
				description: 'Title of the page to operate on',
				required: false,
			},
			{
				displayName: 'Page Content',
				name: 'pageContent',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Content of the page (for create and update operations)',
				required: false,
				displayOptions: {
					show: {
						operation: ['create', 'update'],
					},
				},
			},
		],
	};

	async supplyData(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData> {
		const operation = this.getNodeParameter('operation', itemIndex) as string;
		const pageTitle = this.getNodeParameter('pageTitle', itemIndex) as string;
		const pageContent = operation !== 'get' ? this.getNodeParameter('pageContent', itemIndex, '') as string : '';
		const credentials = await this.getCredentials('mediaWikiApi');

		const client = new MediaWikiClient(credentials, this.helpers);

		const tool = new DynamicTool({
			name: 'mediawiki_page_tool',
			description: `MediaWiki page tool for ${operation} operations. Use this to ${operation} pages on MediaWiki instances.`,
			func: async () => {
				try {
					let responseData;

					if (operation === 'get') {
						responseData = await client.getPage({ title: pageTitle });
					} else if (operation === 'create' || operation === 'update') {
						if (!pageContent) {
							return JSON.stringify({
								error: 'Content is required for create and update operations.',
							});
						}
						responseData = await client.editPage({ title: pageTitle, content: pageContent });
					} else {
						return JSON.stringify({
							error: 'Invalid operation. Supported operations: get, create, update',
						});
					}

					return JSON.stringify({
						success: true,
						operation,
						title: pageTitle,
						response: responseData,
					});
				} catch (error) {
					return JSON.stringify({
						success: false,
						error: error instanceof Error ? error.message : String(error),
					});
				}
			},
		});

		return {
			response: tool,
		};
	}
}