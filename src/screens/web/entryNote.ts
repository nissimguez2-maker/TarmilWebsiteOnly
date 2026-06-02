/**
 * Entry / visa reminder copy — deliberately NON-authoritative.
 *
 * This NEVER states whether a visa is or isn't required, and NEVER claims a
 * destination is "visa-free" or "open". Entry rules change constantly and depend
 * on nationality, passport, purpose, and length of stay — getting that wrong in
 * an app's voice is exactly the failure mode in Moffatt v. Air Canada (an
 * operator was held liable for its bot's confident-but-wrong policy answer). So
 * this module makes NO external call and renders NO verdict: it returns a short,
 * generic nudge that points the traveler to their own government's official
 * source before they commit money. It is a reminder, not advice.
 */

/**
 * A short, disclaimed reminder to check entry + visa rules on an official
 * government source. Returns `null` when there's nothing useful to say (missing
 * names, or home and destination are the same country) so the caller can simply
 * render nothing. Never returns a definitive visa verdict.
 */
export function entryReminder(
  homeCountryName: string,
  destCountryName: string,
): string | null {
  const home = (homeCountryName ?? '').trim();
  const dest = (destCountryName ?? '').trim();

  if (!dest) return null;
  // Same-country trip: no cross-border entry step to remind about.
  if (home && home.toLowerCase() === dest.toLowerCase()) return null;

  return `Entry and visa rules for ${dest} depend on your nationality and can change. Check your government's official source before you book.`;
}
