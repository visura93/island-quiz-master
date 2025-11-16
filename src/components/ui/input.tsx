import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, onPaste, ...props }, ref) => {
    const handlePaste = React.useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
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
        const input = e.currentTarget;
        const start = input.selectionStart || 0;
        const end = input.selectionEnd || 0;
        const currentValue = input.value;
        const newValue = currentValue.substring(0, start) + processedText + currentValue.substring(end);
        
        // Update the value
        if (props.onChange) {
          const syntheticEvent = {
            ...e,
            target: { ...input, value: newValue },
            currentTarget: { ...input, value: newValue },
          } as React.ChangeEvent<HTMLInputElement>;
          props.onChange(syntheticEvent);
        }
        
        // Set cursor position after pasted text
        setTimeout(() => {
          const newCursorPos = start + processedText.length;
          input.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
      } else {
        // No text found - let default behavior run
        if (onPaste) {
          onPaste(e);
        }
      }
    }, [onPaste, props.onChange]);

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        onPaste={handlePaste}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
