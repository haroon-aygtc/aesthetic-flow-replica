
/**
 * Simple Markdown parser
 */
export const marked = {
  parse: (text: string): string => {
    let html = text;
    
    // Convert headers
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    
    // Convert bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert italics
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert lists
    html = html.replace(/^\- (.*$)/gm, '<ul><li>$1</li></ul>');
    html = html.replace(/<\/ul>\s*<ul>/g, '');
    
    // Convert code blocks
    html = html.replace(/```([^`]*?)```/gs, '<pre><code>$1</code></pre>');
    
    // Convert paragraphs
    html = html.replace(/^(?!<[a-z])(.*$)/gm, '<p>$1</p>');
    html = html.replace(/<p>\s*<\/p>/g, '');
    
    return html;
  }
};
