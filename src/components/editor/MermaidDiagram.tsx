import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import logger from '@/lib/utils/logger';

// Initialize Mermaid (only once)
try {
    mermaid.initialize({
        startOnLoad: false, // We manually render
        theme: 'default', // Or 'dark', 'neutral', 'forest' - could be dynamic
        // securityLevel: 'strict', // Consider security implications
    });
    logger.log('[MermaidDiagram] Mermaid initialized.');
} catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error('[MermaidDiagram] Failed to initialize Mermaid.', error);
}


const MermaidDiagram: React.FC<NodeViewProps> = ({ node, updateAttributes, editor }) => {
    const code = node.textContent;
    const mermaidRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const renderMermaid = async () => {
            if (mermaidRef.current && code) {
                setIsLoading(true);
                setError(null);
                try {
                    // Ensure Mermaid is ready (it might initialize async)
                    await mermaid.run({ nodes: [mermaidRef.current] });
                    // The above might not work directly if the node isn't in DOM yet or needs explicit svg
                    // Alternative: render directly
                    const { svg } = await mermaid.render(`mermaid-graph-${node.attrs.id || Date.now()}`, code);
                    if (mermaidRef.current) {
                         mermaidRef.current.innerHTML = svg;
                    }
                    logger.log('[MermaidDiagram] Rendered diagram.', { nodeId: node.attrs.id });

                } catch (err) {
                    const error = err instanceof Error ? err : new Error(String(err));
                    logger.error('[MermaidDiagram] Failed to render diagram.', error);
                    setError(error.message); // Use the wrapped/checked error
                    if (mermaidRef.current) {
                        mermaidRef.current.innerHTML = `<pre class="mermaid-error">Error rendering diagram:\n${error.message}</pre>`; // Use the wrapped/checked error
                    }
                } finally {
                    setIsLoading(false);
                }
            } else {
                 setIsLoading(false); // No code or ref, nothing to load
            }
        };

        renderMermaid();
    }, [code, node.attrs.id]); // Re-render if code changes

    // Basic styling - enhance as needed
    const wrapperStyle: React.CSSProperties = {
        position: 'relative',
        padding: '1rem',
        margin: '1rem 0',
        border: '1px solid #ccc',
        borderRadius: '4px',
        backgroundColor: '#f9f9f9',
        overflow: 'auto', // Handle large diagrams
    };

    const loadingStyle: React.CSSProperties = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: '#888',
    };

     const errorStyle: React.CSSProperties = {
        color: 'red',
        whiteSpace: 'pre-wrap', // Show error formatting
        fontFamily: 'monospace',
    };

    return (
        // NodeViewWrapper provides necessary attributes for TipTap interaction
        <NodeViewWrapper className="mermaid-diagram-wrapper" style={wrapperStyle}>
            {/* Render the Mermaid diagram here */}
            <div ref={mermaidRef} className="mermaid-diagram-container">
                {/* Initial content or placeholder */}
                {isLoading && <div style={loadingStyle}>Loading Diagram...</div>}
                {/* Error display is handled by setting innerHTML in useEffect */}
            </div>

            {/* Optional: Add controls or display the raw code */}
            {/* <pre><code>{code}</code></pre> */}
        </NodeViewWrapper>
    );
};

export default MermaidDiagram;