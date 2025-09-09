export function cleanString(input) {
  if (!input) return "";

  return input
    // remove hashtags (#something)
    .replace(/#\w+/g, "")
    // remove emojis (basic unicode emoji ranges)
    .replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|\uD83E[\uDD00-\uDDFF])/g,
      ""
    )
    // remove all special characters except letters, numbers, and spaces
    .replace(/[^a-zA-Z0-9 ]/g, "")
    // collapse multiple spaces into one
    .replace(/\s+/g, " ")
    // trim start/end spaces
    .trim();
}
