/**
 * The install path, in one place.
 *
 * Exactly one marketplace URL is correct: `niel-cody/oolio-product-os`. The repo's earlier
 * locations redirect, but each one registers as a *separate* marketplace, so a teammate who
 * copies an old command ends up on a marketplace that never updates. PUBLISHING.md carries
 * the long version; these are the two lines a new person actually types.
 */
export const MARKETPLACE_COMMAND = "/plugin marketplace add niel-cody/oolio-product-os";
export const INSTALL_COMMAND = "/plugin install oolio-pm@oolio-product-os";
export const REPO_URL = "https://github.com/niel-cody/oolio-product-os";
