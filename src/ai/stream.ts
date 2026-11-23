/**
 * Incremental JSON string extractor for the "narrative" property
 * Allows streaming the opening narrative words to the UI before the complete JSON object finishes.
 */
export function extractPartialNarrative(partialJson: string): string {
  // Look for "narrative": " ... "
  const keyMatch = partialJson.match(/"narrative"\s*:\s*"/);
  if (!keyMatch || keyMatch.index === undefined) return '';

  const startIndex = keyMatch.index + keyMatch[0].length;
  let inEscape = false;
  let result = '';

  for (let i = startIndex; i < partialJson.length; i++) {
    const char = partialJson[i];
    if (inEscape) {
      if (char === 'n') result += '\n';
      else if (char === 'r') result += '\r';
      else if (char === 't') result += '\t';
      else if (char === '"') result += '"';
      else if (char === '\\') result += '\\';
      else result += char;
      inEscape = false;
    } else if (char === '\\') {
      inEscape = true;
    } else if (char === '"') {
      // Reached the closing quote of the narrative field
      break;
    } else {
      result += char;
    }
  }

  return result;
}
