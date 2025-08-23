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
		usableAsTool: true,
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
				displayName: 'Page Title',
				name: 'pageTitle',
				type: 'string',
				default: '',
				description: 'Title of the page to create',
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
				description: 'Content of the new page',
				required: false,
			},
		],
	};

	async supplyData(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData> {
		const pageTitle = this.getNodeParameter('pageTitle', itemIndex) as string;
		const pageContent = this.getNodeParameter('pageContent', itemIndex) as string;
		const credentials = await this.getCredentials('mediaWikiApi');

		const client = new MediaWikiClient(credentials, this.helpers);

		const tool = new DynamicTool({
			name: 'mediawiki_create_page_tool',
			description: `Create a new MediaWiki page titled "${pageTitle}". Use this to create new pages with content.`,
			func: async () => {
				try {
					const responseData = await client.editPage({ title: pageTitle, content: pageContent });

					return JSON.stringify({
						success: true,
						operation: 'create',
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