import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

interface MathTextProps {
    text: string;
    color?: string;
    fontSize?: number;
    style?: any;
}

/**
 * MathText — renders text that may contain LaTeX math ($...$) using KaTeX in a WebView.
 * Falls back to plain styled text for non-math content.
 * Uses KaTeX CDN for rendering.
 */
const MathText: React.FC<MathTextProps> = ({
    text,
    color = '#FFFFFF',
    fontSize = 16,
    style,
}) => {
    // Check if text contains LaTeX
    const hasLatex = text.includes('$');

    // Calculate height based on content
    const estimatedHeight = hasLatex ? Math.max(fontSize * 2.5, 40) : fontSize * 1.8;

    const html = useMemo(() => {
        if (!hasLatex) return '';

        // Process the text: convert $...$ to KaTeX rendered spans
        // Escape HTML entities first
        const escaped = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: transparent;
      color: ${color};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: ${fontSize}px;
      font-weight: 600;
      line-height: 1.5;
      display: flex;
      align-items: center;
      min-height: 100vh;
      padding: 4px 0;
      -webkit-text-size-adjust: none;
    }
    .katex { font-size: 1.1em !important; color: ${color}; }
    .katex .katex-mathml { display: none; }
    #content { width: 100%; }
  </style>
</head>
<body>
  <div id="content">${escaped}</div>
  <script>
    renderMathInElement(document.getElementById('content'), {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\\\(', right: '\\\\)', display: false },
        { left: '\\\\[', right: '\\\\]', display: true },
      ],
      throwOnError: false,
    });

    // Send height back to RN
    setTimeout(() => {
      const h = document.getElementById('content').scrollHeight;
      window.ReactNativeWebView.postMessage(JSON.stringify({ height: h }));
    }, 300);
  </script>
</body>
</html>`;
    }, [text, color, fontSize, hasLatex]);

    // If no LaTeX, don't use WebView — caller should use regular Text
    if (!hasLatex) {
        return null;
    }

    return (
        <View style={[{ height: estimatedHeight, overflow: 'hidden' }, style]}>
            <WebView
                source={{ html }}
                style={[styles.webview, { height: estimatedHeight }]}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                javaScriptEnabled={true}
                originWhitelist={['*']}
                onMessage={(event) => {
                    // Could adjust height dynamically here
                }}
                androidLayerType="hardware"
                overScrollMode="never"
                setBuiltInZoomControls={false}
                nestedScrollEnabled={false}
            />
        </View>
    );
};

export const containsLatex = (text: string): boolean => text.includes('$');

const styles = StyleSheet.create({
    webview: {
        backgroundColor: 'transparent',
        opacity: 0.99, // Android WebView transparency fix
    },
});

export default MathText;
