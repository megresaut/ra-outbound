// Stubbed DiscoverySource. Intentionally returns no candidates — this is a
// placeholder for a future directory-based source (e.g. NARPM directory,
// IREM directory, regional PM associations). When that integration lands,
// replace the search() body — do NOT silently invent results in the meantime.

import type { Candidate, DiscoverySource } from "../types";

export class DirectoryDiscoverySource implements DiscoverySource {
  readonly name = "directory-stub";

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async search(_metro: string, _limit: number): Promise<Candidate[]> {
    // TODO(discovery): wire a real directory source. Candidates:
    //   - NARPM member directory (https://www.narpm.org/find-a-property-manager/)
    //   - IREM member directory
    //   - Regional PM associations per metro
    // Each candidate must include verified company + domain + location.
    // Returning unverified placeholders is forbidden by the discovery rubric.
    return [];
  }
}
