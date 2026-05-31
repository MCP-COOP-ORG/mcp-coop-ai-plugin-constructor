import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { MarkdownFormatPipe } from './markdown-format-pipe';

describe('MarkdownFormatPipe', () => {
    let pipe: MarkdownFormatPipe;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                MarkdownFormatPipe,
                {
                    provide: DomSanitizer,
                    useValue: { bypassSecurityTrustHtml: (val: string) => val },
                },
            ],
        });
        pipe = TestBed.inject(MarkdownFormatPipe);
    });

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('returns empty string for null/undefined/empty input', () => {
        expect(pipe.transform(null)).toBe('');
        expect(pipe.transform(undefined)).toBe('');
        expect(pipe.transform('')).toBe('');
    });

    it('escapes HTML tags to prevent XSS', () => {
        const input = '<script>alert("XSS")</script>';
        const result = pipe.transform(input);
        expect(result).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
    });

    it('formats headers', () => {
        expect(pipe.transform('# Header 1')).toBe('<h1 class="markdown-h1">Header 1</h1>');
        expect(pipe.transform('## Header 2')).toBe('<h2 class="markdown-h2">Header 2</h2>');
        expect(pipe.transform('### Header 3')).toBe('<h3 class="markdown-h3">Header 3</h3>');
    });

    it('formats bold and italic text', () => {
        expect(pipe.transform('This is **bold** text.')).toBe('This is <strong>bold</strong> text.');
        expect(pipe.transform('This is *italic* text.')).toBe('This is <em>italic</em> text.');
    });

    it('formats inline code', () => {
        expect(pipe.transform('Use `signal()`')).toBe('Use <code class="markdown-code">signal()</code>');
    });

    it('formats code blocks without formatting content inside', () => {
        const input = '```\n<script>\n**bold**\n```';
        const expected = '<pre class="markdown-pre"><code>\n&lt;script&gt;\n**bold**\n</code></pre>';
        expect(pipe.transform(input)).toBe(expected);
    });

    it('formats lists and wraps them in ul', () => {
        const input = '- Item 1\n- Item 2';
        const result = pipe.transform(input);
        expect(result).toContain('<ul class="markdown-ul">');
        expect(result).toContain('<li class="markdown-li">Item 1</li>');
        expect(result).toContain('<li class="markdown-li">Item 2</li>');
        expect(result).toContain('</ul>');
    });

    it('converts newlines to br tags outside of block elements', () => {
        expect(pipe.transform('Line 1\nLine 2')).toBe('Line 1<br>Line 2');
    });
});
