import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
    name: 'markdownFormat',
    standalone: true,
})
export class MarkdownFormatPipe implements PipeTransform {
    private readonly sanitizer = inject(DomSanitizer);

    transform(value: string | undefined | null): SafeHtml | string {
        if (!value) {
            return '';
        }

        // 1. Basic HTML escaping to prevent XSS
        let text = value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');

        // 2. Extract Code Blocks to prevent formatting inside them
        const codeBlocks: string[] = [];
        text = text.replace(/```([\s\S]*?)```/g, (match, p1) => {
            codeBlocks.push(`<pre class="markdown-pre"><code>${p1}</code></pre>`);
            return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
        });

        // 3. Headers
        text = text.replace(/^### (.*$)/gim, '<h3 class="markdown-h3">$1</h3>');
        text = text.replace(/^## (.*$)/gim, '<h2 class="markdown-h2">$1</h2>');
        text = text.replace(/^# (.*$)/gim, '<h1 class="markdown-h1">$1</h1>');

        // 4. Bold and Italic
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // 5. Inline Code
        text = text.replace(/`([^`]+)`/g, '<code class="markdown-code">$1</code>');

        // 6. Lists
        // Replace "- item" with "<li>item</li>"
        text = text.replace(/^-\s+(.*$)/gim, '<li class="markdown-li">$1</li>');
        // Wrap consecutive <li> tags in <ul>
        text = text.replace(
            /(<li class="markdown-li">.*<\/li>(?:\n<li class="markdown-li">.*<\/li>)*)/gim,
            '<ul class="markdown-ul">\n$1\n</ul>',
        );

        // 7. Line Breaks
        text = text.replace(/\n/g, '<br>');
        // Cleanup <br> around block elements to prevent excessive spacing
        text = text.replace(/(<\/h[1-3]>|<ul.*?>|<\/ul>|<\/li>)<br>/g, '$1');
        text = text.replace(/<br>(<ul.*?>|<\/ul>|<li.*?>)/g, '$1');

        // 8. Restore Code Blocks
        codeBlocks.forEach((block, index) => {
            text = text.replace(`__CODE_BLOCK_${index}__`, block);
        });

        return this.sanitizer.bypassSecurityTrustHtml(text);
    }
}
