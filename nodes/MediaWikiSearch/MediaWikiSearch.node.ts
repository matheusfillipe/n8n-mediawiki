import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeConnectionType,
} from 'n8n-workflow'
import { MediaWikiClient } from '../../src/MediaWikiClient'

export class MediaWikiSearch implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'MediaWiki Search',
    name: 'mediaWikiSearch',
    icon: 'file:mediawiki.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["searchTerm"] ? "Search: " + $parameter["searchTerm"] : "MediaWiki search operations"}}',
    description: 'Search MediaWiki pages',
    usableAsTool: true,
    defaults: {
      name: 'MediaWiki Search',
    },
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    credentials: [{ name: 'mediaWikiApi', required: false }],
    properties: [
      {
        displayName: 'Search Term',
        name: 'searchTerm',
        type: 'string',
        default: '',
        required: true,
        description:
          'Keywords or phrases to search for in MediaWiki pages. Supports partial matches, multiple words, and quoted phrases. Examples: "quantum physics", "machine learning algorithms"',
      },
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        typeOptions: { minValue: 1, maxValue: 500 },
        default: 10,
        description: 'Max number of results to return',
      },
    ],
  }

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData()
    const out: INodeExecutionData[] = []

    for (let i = 0; i < items.length; i++) {
      try {
        const searchTerm = this.getNodeParameter('searchTerm', i) as string
        const limit = this.getNodeParameter('limit', i) as number
        const credentials = await this.getCredentials('mediaWikiApi')
        const client = new MediaWikiClient(credentials, this.helpers)
        const response = await client.searchPages({ query: searchTerm, limit })

        out.push({ json: { success: true, searchTerm, limit, response } })
      } catch (error) {
        if (this.continueOnFail()) {
          out.push({
            json: {
              success: false,
              error: error instanceof Error ? error.message : String(error),
            },
          })
          continue
        }
        throw error
      }
    }

    return [out]
  }
}
