import {
	ISupplyDataFunctions,
	INodeType,
	INodeTypeDescription,
	SupplyData,
	NodeConnectionType,
} from 'n8n-workflow';

import { DynamicTool } from '@langchain/core/tools';
import { MediaWikiClient } from '../../src/MediaWikiClient';

export class MediaWikiCreatePageTool implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'MediaWiki Create Page Tool',
		name: 'mediaWikiCreatePageTool',
		icon: 'file:mediawiki.svg',
		group: ['transform'],
		version: 1,
		description: 'AI tool for creating new MediaWiki pages',
		defaults: {
			name: 'MediaWiki Create Page Tool',
		},
		codex: {
			categories: ['AI'],
			subcategories: {
				AI: ['Tools'],
			},
			resources: {
				primaryDocumentation: [
					{
						url: 'https://www.mediawiki.org/wiki/API:Edit',
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
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Tool Name',
				name: 'toolName',
				type: 'string',
				default: 'mediawiki_create_page',
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
				default: 'Tool for creating new MediaWiki pages. Requires a page title and content to create a new page on the MediaWiki instance.',
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
							error: 'Invalid input format. Expected JSON with title and content fields.',
						});
					}

					const { title, content } = parsedInput;

					if (!title) {
						return JSON.stringify({
							error: 'Missing required field: title is required.',
						});
					}

					if (!content) {
						return JSON.stringify({
							error: 'Missing required field: content is required.',
						});
					}

					const responseData = await client.editPage({ title, content });

					return JSON.stringify({
						success: true,
						operation: 'create',
						title,
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