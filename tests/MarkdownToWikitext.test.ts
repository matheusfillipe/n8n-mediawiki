import { MarkdownToWikitextConverter, convertMarkdownToWikitext, ConversionOptions } from '../src/MarkdownToWikitext';

describe('MarkdownToWikitextConverter', () => {
  let converter: MarkdownToWikitextConverter;

  beforeEach(() => {
    converter = new MarkdownToWikitextConverter();
  });

  describe('Headers', () => {
    test('converts h1 headers correctly', () => {
      const markdown = '# Header 1';
      const expected = '== Header 1 ==';
      expect(converter.convert(markdown)).toBe(expected);
    });

    test('converts h2 headers correctly', () => {
      const markdown = '## Header 2';
      const expected = '=== Header 2 ===';
      expect(converter.convert(markdown)).toBe(expected);
    });

    test('converts h6 headers correctly', () => {
      const markdown = '###### Header 6';
      const expected = '======= Header 6 =======';
      expect(converter.convert(markdown)).toBe(expected);
    });

    test('converts multiple headers', () => {
      const markdown = `# Main Title
## Subtitle
### Section`;
      const expected = `== Main Title ==
=== Subtitle ===
==== Section ====`;
      expect(converter.convert(markdown)).toBe(expected);
    });
  });

  describe('Links', () => {
    test('converts external links correctly', () => {
      const markdown = '[Google](https://google.com)';
      const expected = '[https://google.com Google]';
      expect(converter.convert(markdown)).toBe(expected);
    });

    test('converts multiple external links', () => {
      const markdown = '[Google](https://google.com) and [GitHub](https://github.com)';
      const expected = '[https://google.com Google] and [https://github.com GitHub]';
      expect(converter.convert(markdown)).toBe(expected);
    });

    test('preserves internal wikitext links', () => {
      const markdown = '[[Internal Page]]';
      const expected = '[[Internal Page]]';
      expect(converter.convert(markdown)).toBe(expected);
    });
  });

  describe('Lists', () => {
    test('converts unordered lists correctly', () => {
      const markdown = `- Item 1
- Item 2
- Item 3`;
      const expected = `* Item 1
* Item 2
* Item 3`;
      expect(converter.convert(markdown)).toBe(expected);
    });

    test('converts ordered lists correctly', () => {
      const markdown = `1. First item
2. Second item
3. Third item`;
      const expected = `# First item
# Second item
# Third item`;
      expect(converter.convert(markdown)).toBe(expected);
    });

    test('converts nested unordered lists correctly', () => {
      const markdown = `- Item 1
  - Subitem 1
  - Subitem 2
- Item 2`;
      const expected = `* Item 1
** Subitem 1
** Subitem 2
* Item 2`;
      expect(converter.convert(markdown)).toBe(expected);
    });

    test('converts nested ordered lists correctly', () => {
      const markdown = `1. Item 1
  1. Subitem 1
  2. Subitem 2
2. Item 2`;
      const expected = `# Item 1
## Subitem 1
## Subitem 2
# Item 2`;
      expect(converter.convert(markdown)).toBe(expected);
    });

    test('handles mixed list types', () => {
      const markdown = `- Item 1
- Item 2
1. Numbered item`;
      const expected = `* Item 1
* Item 2
# Numbered item`;
      expect(converter.convert(markdown)).toBe(expected);
    });
  });

  describe('Formatting', () => {
    test('converts bold text with **', () => {
      const markdown = '**bold text**';
      const expected = "'''bold text'''";
      expect(converter.convert(markdown)).toBe(expected);
    });

    test('converts bold text with __', () => {
      const markdown = '__bold text__';
      const expected = "'''bold text'''";
      expect(converter.convert(markdown)).toBe(expected);
    });

    test('converts italic text with *', () => {
      const markdown = '*italic text*';
      const expected = "''italic text''";
      expect(converter.convert(markdown)).toBe(expected);
    });

    test('converts italic text with _', () => {
      const markdown = '_italic text_';
      const expected = "''italic text''";
      expect(converter.convert(markdown)).toBe(expected);
    });

    test('converts inline code', () => {
      const markdown = '`code snippet`';
      const expected = '<code>code snippet</code>';
      expect(converter.convert(markdown)).toBe(expected);
    });

    test('handles mixed formatting', () => {
      const markdown = '**Bold** and *italic* and `code`';
      const expected = "'''Bold''' and ''italic'' and <code>code</code>";
      expect(converter.convert(markdown)).toBe(expected);
    });
  });

  describe('Code Blocks', () => {
    test('converts fenced code blocks with language', () => {
      const markdown = '```javascript\nconsole.log("hello");\n```';
      const expected = '<syntaxhighlight lang="javascript">\nconsole.log("hello");\n</syntaxhighlight>';
      expect(converter.convert(markdown)).toBe(expected);
    });

    test('converts fenced code blocks without language', () => {
      const markdown = '```\nsome code\n```';
      const expected = '<pre>\nsome code\n</pre>';
      expect(converter.convert(markdown)).toBe(expected);
    });

    test('converts indented code blocks', () => {
      const markdown = '    indented code';
      const expected = '<pre>indented code</pre>';
      expect(converter.convert(markdown)).toBe(expected);
    });
  });

  describe('Tables', () => {
    test('converts simple tables to wikitext format', () => {
      const markdown = `| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |`;

      const expected = `{| class="wikitable"
! Header 1 !! Header 2
|-
| Cell 1 || Cell 2
|-
| Cell 3 || Cell 4
|}`;
      expect(converter.convert(markdown)).toBe(expected);
    });

    test('converts tables to HTML when option is set', () => {
      const converter = new MarkdownToWikitextConverter({ useHtmlTables: true });
      const markdown = `| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |`;

      const expected = `<table class="wikitable">
<tr><th>Header 1</th><th>Header 2</th></tr>
<tr><td>Cell 1</td><td>Cell 2</td></tr>
</table>`;
      expect(converter.convert(markdown)).toBe(expected);
    });

    test('handles tables with varying cell content', () => {
      const markdown = `| Name | Age | City |
|------|-----|------|
| John | 25  | NYC  |
| Jane | 30  | LA   |`;

      const expected = `{| class="wikitable"
! Name !! Age !! City
|-
| John || 25 || NYC
|-
| Jane || 30 || LA
|}`;
      expect(converter.convert(markdown)).toBe(expected);
    });
  });

  describe('Horizontal Rules', () => {
    test('converts --- to wikitext horizontal rule', () => {
      const markdown = '---';
      const expected = '----';
      expect(converter.convert(markdown)).toBe(expected);
    });

    test('converts *** to wikitext horizontal rule', () => {
      const markdown = '***';
      const expected = '----';
      expect(converter.convert(markdown)).toBe(expected);
    });

    test('converts longer dashes', () => {
      const markdown = '-----';
      const expected = '----';
      expect(converter.convert(markdown)).toBe(expected);
    });
  });

  describe('Character Escaping', () => {
    test('escapes pipes outside of tables', () => {
      const markdown = 'This | is | a | test';
      const expected = 'This <nowiki>|</nowiki> is <nowiki>|</nowiki> a <nowiki>|</nowiki> test';
      expect(converter.convert(markdown)).toBe(expected);
    });

    test('does not escape pipes in tables', () => {
      const markdown = `| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |`;

      const result = converter.convert(markdown);
      expect(result).toContain('! Header 1 !! Header 2');
      expect(result).toContain('| Cell 1 || Cell 2');
    });
  });

  describe('Complex Examples', () => {
    test('converts complex markdown document', () => {
      const markdown = `# Main Title

This is a paragraph with **bold** and *italic* text.

## Lists

- First item
- Second item with [link](https://example.com)
  - Nested item

1. Numbered item
2. Another numbered item

## Code

Here's some \`inline code\` and a block:

\`\`\`python
def hello():
    print("Hello, World!")
\`\`\`

## Table

| Name | Role |
|------|------|
| Alice | Developer |
| Bob | Designer |

---

That's all!`;

      const result = converter.convert(markdown);
      
      // Check key transformations
      expect(result).toContain('== Main Title ==');
      expect(result).toContain("'''bold'''");
      expect(result).toContain("''italic''");
      expect(result).toContain('=== Lists ===');
      expect(result).toContain('* First item');
      expect(result).toContain('[https://example.com link]');
      expect(result).toContain('** Nested item');
      expect(result).toContain('# Numbered item');
      expect(result).toContain('<code>inline code</code>');
      expect(result).toContain('<syntaxhighlight lang="python">');
      expect(result).toContain('{| class="wikitable"');
      expect(result).toContain('! Name !! Role');
      expect(result).toContain('----');
    });
  });

  describe('Utility Function', () => {
    test('convertMarkdownToWikitext function works', () => {
      const markdown = '# Test Header';
      const expected = '== Test Header ==';
      expect(convertMarkdownToWikitext(markdown)).toBe(expected);
    });

    test('convertMarkdownToWikitext accepts options', () => {
      const markdown = `| A | B |
|---|---|
| 1 | 2 |`;
      const options: ConversionOptions = { useHtmlTables: true };
      const result = convertMarkdownToWikitext(markdown, options);
      expect(result).toContain('<table class="wikitable">');
    });
  });

  describe('Edge Cases', () => {
    test('handles empty string', () => {
      expect(converter.convert('')).toBe('');
    });

    test('handles string with only whitespace', () => {
      expect(converter.convert('   \n  \n  ')).toBe('');
    });

    test('handles malformed tables gracefully', () => {
      const markdown = '| Header |\n| Cell |';
      const result = converter.convert(markdown);
      // Should not crash and should handle gracefully
      expect(typeof result).toBe('string');
    });

    test('handles mixed line endings', () => {
      const markdown = '# Header\r\n\r\nParagraph\r\n';
      const result = converter.convert(markdown);
      expect(result).toContain('== Header ==');
      expect(result).toContain('Paragraph');
    });
  });
});