export function formatQuoteText(quoteText: string) {
  if (quoteText.includes(":\n") || quoteText.includes(': "')) {
    return quoteText.split("\n").map((line, i) => (
      <div key={i} className="quote-line">{line}</div>
    ))
  }
  return <>"{quoteText}"</>
}
