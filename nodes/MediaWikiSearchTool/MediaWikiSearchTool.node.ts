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
				displayName: 'Tool Name',
				name: 'toolName',
				type: 'string',
				default: 'mediawiki_search',
				description: 'Name of the tool for AI agent reference',
				required: true,
			},
			{
				displayName: 'Tool Description',
				name: 'toolDescription',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				default: 'Tool for searching MediaWiki pages. Can search for articles, content, and pages on MediaWiki instances like Wikipedia.',
				description: 'Description that helps the AI agent understand when to use this tool',
				required: true,
			},
			{
				displayName: 'Default Limit',
				name: 'defaultLimit',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 500,
				},
				default: 10,
				description: 'Default number of search results to return when not specified',
			},
		],
	};

	async supplyData(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData> {
		const toolName = this.getNodeParameter('toolName', itemIndex) as string;
		const toolDescription = this.getNodeParameter('toolDescription', itemIndex) as string;
		const defaultLimit = this.getNodeParameter('defaultLimit', itemIndex) as number;
		const credentials = await this.getCredentials('mediaWikiApi');

		const client = new MediaWikiClient(credentials, this.helpers);

		const tool = new DynamicTool({
			name: toolName,
			description: toolDescription,
			func: async (input: string) => {
				try {
					let parsedInput: any;
					try {
						parsedInput = JSON.parse(input);
					} catch {
						// If not JSON, treat as plain search query
						parsedInput = { query: input };
					}

					const { query, limit = defaultLimit } = parsedInput;

					if (!query) {
						return JSON.stringify({
							error: 'Search query is required.',
						});
					}

					const responseData = await client.searchPages({ query, limit });

					return JSON.stringify(responseData);
				} catch (error) {
					return JSON.stringify({
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