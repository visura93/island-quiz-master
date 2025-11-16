import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, onPaste, ...props }, ref) => {
  const handlePaste = React.useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    // For legacy Sinhala fonts, the clipboard might contain corrupted data
    // We need to check if the clipboard has Unicode before interfering
    // Otherwise, let the browser handle it naturally
    
    // First, peek at the clipboard data without preventing default
    const types = Array.from(e.clipboardData.types);
    let pastedText = '';
    let hasUnicodeSinhala = false;
    let hasUnicodeTamil = false;
    
    // Try to read clipboard data to check if it's Unicode
    if (types.includes('text/plain')) {
      try {
        pastedText = e.clipboardData.getData('text/plain');
        hasUnicodeSinhala = /[\u0D80-\u0DFF]/.test(pastedText);
        hasUnicodeTamil = /[\u0B80-\u0BFF]/.test(pastedText);
      } catch (err) {
        // Ignore errors
      }
    }
    
    // If we don't have Unicode Sinhala/Tamil, let browser handle it completely
    // This is important for legacy fonts where the browser might do better conversion
    if (!hasUnicodeSinhala && !hasUnicodeTamil) {
      // Let the browser handle it - don't interfere at all
      if (onPaste) {
        onPaste(e);
      }
      return; // Don't prevent default
    }
    
    // We have Unicode text - handle it properly
    if (pastedText && pastedText.length > 0) {
      // Try HTML format first as it often preserves encoding better
      if (types.includes('text/html')) {
        try {
          const htmlData = e.clipboardData.getData('text/html');
          if (htmlData) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlData;
            const extractedText = tempDiv.textContent || tempDiv.innerText || '';
            if (extractedText && /[\u0D80-\u0DFF\u0B80-\u0BFF]/.test(extractedText)) {
              pastedText = extractedText;
            }
          }
        } catch (err) {
          // Use plain text if HTML extraction fails
        }
      }
      
      // Normalize Unicode text
      const processedText = pastedText.normalize('NFC');
      
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;
      const currentValue = textarea.value;
      const newValue = currentValue.substring(0, start) + processedText + currentValue.substring(end);
      
      // Update the value
      if (props.onChange) {
        const syntheticEvent = {
          ...e,
          target: { ...textarea, value: newValue },
          currentTarget: { ...textarea, value: newValue },
        } as React.ChangeEvent<HTMLTextAreaElement>;
        props.onChange(syntheticEvent);
      }
      
      // Set cursor position after pasted text
      setTimeout(() => {
        const newCursorPos = start + processedText.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    } else {
      // No text found - let default behavior run
      if (onPaste) {
        onPaste(e);
      }
    }
  }, [onPaste, props.onChange]);

  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      onPaste={handlePaste}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
