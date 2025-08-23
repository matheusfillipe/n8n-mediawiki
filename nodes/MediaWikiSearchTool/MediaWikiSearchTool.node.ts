import {
	ISupplyDataFunctions,
	INodeType,
	INodeTypeDescription,
	SupplyData,
	NodeConnectionType,
} from 'n8n-workflow';

import { DynamicTool } from '@langchain/core/tools';
import { MediaWikiClient } from '../../src/MediaWikiClient';

export class MediaWikiSearchTool implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'MediaWiki Search Tool',
		name: 'mediaWikiSearchTool',
		icon: 'file:mediawiki.svg',
		group: ['transform'],
		version: 1,
		description: 'AI tool for searching MediaWiki pages',
		usableAsTool: true,
		defaults: {
			name: 'MediaWiki Search Tool',
		},
		codex: {
			categories: ['AI'],
			subcategories: {
				AI: ['Tools'],
			},
			resources: {
				primaryDocumentation: [
					{
						url: 'https://www.mediawiki.org/wiki/API:Search',
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
				displayName: 'Search Term',
				name: 'searchTerm',
				type: 'string',
				default: '',
				description: 'The search term to find pages',
				required: false,
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
				required: false,
			},
		],
	};

	async supplyData(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData> {
		const searchTerm = this.getNodeParameter('searchTerm', itemIndex) as string;
		const limit = this.getNodeParameter('limit', itemIndex) as number;
		const credentials = await this.getCredentials('mediaWikiApi');

		const client = new MediaWikiClient(credentials, this.helpers);

		const tool = new DynamicTool({
			name: 'mediawiki_search_tool',
			description: `Search MediaWiki pages for "${searchTerm}". Use this to find pages matching search terms.`,
			func: async () => {
				try {
					const responseData = await client.searchPages({ query: searchTerm, limit });

					return JSON.stringify({
						success: true,
						searchTerm,
						limit,
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