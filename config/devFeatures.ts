/**
 * Centralized feature flags for development controls and presentation settings.
 * In normal production, all dev outcome overrides, role switchers, and demo panels are hidden.
 */
export const DEV_FEATURES = {
  /**
   * Manual transaction outcome overrides (AUTO, SUCCESS, PENDING, FAILED) in Pay-In/Pay-Out UI.
   */
  showTransactionOutcomeSelector: process.env.NODE_ENV === 'development',

  /**
   * Quick role preview switcher in profile popover.
   */
  showRolePreviewSwitcher: false,

  /**
   * Quick demo credential fill panel on login screen.
   */
  showDemoCredentials: true,
};
