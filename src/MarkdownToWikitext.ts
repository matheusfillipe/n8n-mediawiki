export interface ConversionOptions {
  preserveLineBreaks?: boolean;
  useHtmlTables?: boolean;
}

export class MarkdownToWikitextConverter {
  private options: ConversionOptions;

  constructor(options: ConversionOptions = {}) {
    this.options = {
      preserveLineBreaks: false,
      useHtmlTables: false,
      ...options,
    };
  }

  convert(markdown: string): string {
    let wikitext = markdown;

    // Process in order of precedence to avoid conflicts
    wikitext = this.convertCodeBlocks(wikitext);
    wikitext = this.convertTables(wikitext);
    wikitext = this.convertHeaders(wikitext);
    wikitext = this.convertLinks(wikitext);
    wikitext = this.convertLists(wikitext);
    wikitext = this.convertHorizontalRules(wikitext);
    // Protect wikitext list markers before formatting
    wikitext = this.protectListMarkers(wikitext);
    wikitext = this.convertFormatting(wikitext);
    wikitext = this.unprotectListMarkers(wikitext);
    wikitext = this.escapeSpecialCharacters(wikitext);

    return wikitext.trim();
  }

  private convertHeaders(text: string): string {
    return text.replace(/^(#{1,6})\s+(.+)$/gm, (_, hashes, content) => {
      const level = hashes.length;
      const equals = '='.repeat(level + 1);
      return `${equals} ${content} ${equals}`;
    });
  }

  private convertLinks(text: string): string {
    // External links: [text](url) -> [url text]
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '[$2 $1]');
    
    // Internal links (assuming [[]] format is desired for internal links)
    // This is a simple heuristic - you might want to make this configurable
    text = text.replace(/\[\[([^\]]+)\]\]/g, '[[$1]]'); // Already wikitext format
    
    return text;
  }

  private convertLists(text: string): string {
    const lines = text.split('\n');
    const result: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Unordered lists
      const unorderedMatch = line.match(/^(\s*)[-*+]\s+(.+)$/);
      if (unorderedMatch) {
        const indentLevel = Math.floor(unorderedMatch[1].length / 2) + 1;
        const bullets = '*'.repeat(indentLevel);
        result.push(`${bullets} ${unorderedMatch[2]}`);
        continue;
      }
      
      // Ordered lists
      const orderedMatch = line.match(/^(\s*)\d+\.\s+(.+)$/);
      if (orderedMatch) {
        const indentLevel = Math.floor(orderedMatch[1].length / 2) + 1;
        const bullets = '#'.repeat(indentLevel);
        result.push(`${bullets} ${orderedMatch[2]}`);
        continue;
      }
      
      result.push(line);
    }
    
    return result.join('\n');
  }

  private convertTables(text: string): string {
    if (this.options.useHtmlTables) {
      return this.convertToHtmlTables(text);
    }
    
    return this.convertToWikitextTables(text);
  }

  private convertToWikitextTables(text: string): string {
    // Look for markdown table patterns
    const lines = text.split('\n');
    const result: string[] = [];
    let i = 0;
    
    while (i < lines.length) {
      const line = lines[i];
      
      // Check if this line starts a table (has pipes)
      if (line.includes('|') && i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        
        // Check if next line is a separator line
        if (nextLine.match(/^\|?[-\s|:]+\|?$/)) {
          // Found a table, process it
          const tableLines = [line, nextLine];
          let j = i + 2;
          
          // Collect all table rows
          while (j < lines.length && lines[j].includes('|') && !lines[j].match(/^\|?[-\s|:]+\|?$/)) {
            tableLines.push(lines[j]);
            j++;
          }
          
          // Convert the table
          const convertedTable = this.convertTableLines(tableLines);
          result.push(convertedTable);
          
          i = j;
          continue;
        }
      }
      
      result.push(line);
      i++;
    }
    
    return result.join('\n');
  }
  
  private convertTableLines(tableLines: string[]): string {
    const headerLine = tableLines[0];
    const dataLines = tableLines.slice(2);
    
    let result = '{| class="wikitable"\n';
    
    // Process header
    const headerCells = this.parseTableRow(headerLine);
    result += '! ' + headerCells.join(' !! ') + '\n';
    
    // Process data rows
    for (const dataLine of dataLines) {
      const dataCells = this.parseTableRow(dataLine);
      result += '|-\n| ' + dataCells.join(' || ') + '\n';
    }
    
    result += '|}';
    return result;
  }

  private convertToHtmlTables(text: string): string {
    // Look for markdown table patterns
    const lines = text.split('\n');
    const result: string[] = [];
    let i = 0;
    
    while (i < lines.length) {
      const line = lines[i];
      
      // Check if this line starts a table (has pipes)
      if (line.includes('|') && i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        
        // Check if next line is a separator line
        if (nextLine.match(/^\|?[-\s|:]+\|?$/)) {
          // Found a table, process it
          const tableLines = [line, nextLine];
          let j = i + 2;
          
          // Collect all table rows
          while (j < lines.length && lines[j].includes('|') && !lines[j].match(/^\|?[-\s|:]+\|?$/)) {
            tableLines.push(lines[j]);
            j++;
          }
          
          // Convert the table to HTML
          const convertedTable = this.convertTableLinesToHtml(tableLines);
          result.push(convertedTable);
          
          i = j;
          continue;
        }
      }
      
      result.push(line);
      i++;
    }
    
    return result.join('\n');
  }
  
  private convertTableLinesToHtml(tableLines: string[]): string {
    const headerLine = tableLines[0];
    const dataLines = tableLines.slice(2);
    
    let result = '<table class="wikitable">\n';
    
    const headerCells = this.parseTableRow(headerLine);
    result += '<tr><th>' + headerCells.join('</th><th>') + '</th></tr>\n';
    
    for (const dataLine of dataLines) {
      const dataCells = this.parseTableRow(dataLine);
      result += '<tr><td>' + dataCells.join('</td><td>') + '</td></tr>\n';
    }
    
    result += '</table>';
    return result;
  }

  private parseTableRow(line: string): string[] {
    // Remove leading/trailing pipes and split
    const cleaned = line.replace(/^\||\|$/g, '').trim();
    return cleaned.split('|').map(cell => cell.trim());
  }

  private convertFormatting(text: string): string {
    // Bold: **text** or __text__ -> '''text'''
    text = text.replace(/\*\*([^*]+)\*\*/g, "'''$1'''");
    text = text.replace(/__([^_]+)__/g, "'''$1'''");
    
    // Italic: *text* or _text_ -> ''text''
    text = text.replace(/\*([^*\n]+)\*/g, "''$1''");
    text = text.replace(/_([^_]+)_/g, "''$1''");
    
    // Inline code: `code` -> <code>code</code>
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    return text;
  }

  private convertCodeBlocks(text: string): string {
    // Fenced code blocks: ```lang\ncode\n``` -> <syntaxhighlight lang="lang">code</syntaxhighlight>
    text = text.replace(/```(\w+)?\n([\s\S]*?)\n```/g, (_, lang, code) => {
      if (lang) {
        return `<syntaxhighlight lang="${lang}">\n${code}\n</syntaxhighlight>`;
      } else {
        return `<pre>\n${code}\n</pre>`;
      }
    });
    
    // Indented code blocks (4 spaces) -> <pre>
    text = text.replace(/^(    .+)$/gm, (match) => {
      const code = match.substring(4);
      return `<pre>${code}</pre>`;
    });
    
    return text;
  }

  private convertHorizontalRules(text: string): string {
    // Horizontal rules: --- or *** -> ----
    return text.replace(/^(-{3,}|\*{3,})$/gm, '----');
  }

  private escapeSpecialCharacters(text: string): string {
    // Escape pipes in non-table context (simple heuristic)
    // This is a basic implementation - you might need more sophisticated logic
    const lines = text.split('\n');
    const result: string[] = [];
    
    for (const line of lines) {
      // Skip table lines
      if (line.startsWith('{|') || line.startsWith('|}') || line.startsWith('|-') || 
          line.startsWith('!') || line.startsWith('|')) {
        result.push(line);
        continue;
      }
      
      // Escape standalone pipes
      const escaped = line.replace(/\|/g, '<nowiki>|</nowiki>');
      result.push(escaped);
    }
    
    return result.join('\n');
  }
  
  private protectListMarkers(text: string): string {
    // Protect wikitext list markers from being converted by formatting
    return text.replace(/^(\s*)(#+|\*+)(\s)/gm, '$1{{LISTMARKER$2}}$3');
  }
  
  private unprotectListMarkers(text: string): string {
    // Restore protected list markers
    // Handle both original markers and those converted by formatting (** -> ''')
    text = text.replace(/\{\{LISTMARKER(#+|\*+)\}\}/g, '$1');
    text = text.replace(/\{\{LISTMARKER'''\}\}/g, '**');
    return text;
  }
}

export function convertMarkdownToWikitext(markdown: string, options?: ConversionOptions): string {
  const converter = new MarkdownToWikitextConverter(options);
  return converter.convert(markdown);
}