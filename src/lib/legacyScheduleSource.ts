
/**
 * Legacy classroom data source
 * Original data provided by SheepTester.
 *
 * Kept separately so that the original
 * data source remains available.
 */

const LEGACY_BASE_URL =
  "https://sheeptester.github.io/uxdy/data";

export async function fetchLegacySchedule(
  term: string
): Promise<Response> {
  return fetch(
    `${LEGACY_BASE_URL}/classrooms-${term}.txt`
  );
}
