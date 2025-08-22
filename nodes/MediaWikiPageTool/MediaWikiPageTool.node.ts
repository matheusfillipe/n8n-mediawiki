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
				displayName: 'Tool Name',
				name: 'toolName',
				type: 'string',
				default: 'mediawiki_page',
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
				default: 'Tool for MediaWiki page operations. Can get, create, or update pages on MediaWiki instances like Wikipedia.',
				description: 'Description that helps the AI agent understand when to use this tool',
				required: true,
			},
		],
	};

	async supplyData(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData> {
		const toolName = this.getNodeParameter('toolName', itemIndex) as string;
		const toolDescription = this.getNodeParameter('toolDescription', itemIndex) as string;
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
						return JSON.stringify({
							error: 'Invalid input format. Expected JSON with operation, title, and optional content fields.',
						});
					}

					const { operation, title, content } = parsedInput;

					if (!operation || !title) {
						return JSON.stringify({
							error: 'Missing required fields: operation and title are required.',
						});
					}

					let responseData;

					if (operation === 'get') {
						responseData = await client.getPage({ title });
					} else if (operation === 'create' || operation === 'update') {
						if (!content) {
							return JSON.stringify({
								error: 'Content is required for create and update operations.',
							});
						}
						responseData = await client.editPage({ title, content });
					} else {
						return JSON.stringify({
							error: 'Invalid operation. Supported operations: get, create, update',
						});
					}

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