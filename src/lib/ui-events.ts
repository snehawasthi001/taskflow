"use client";

export const OPEN_COMMAND_PALETTE_EVENT = "taskflow:open-command-palette";
export const REFRESH_NOTIFICATIONS_EVENT = "taskflow:refresh-notifications";

export function openCommandPalette() {
  window.dispatchEvent(new Event(OPEN_COMMAND_PALETTE_EVENT));
}

export function refreshNotifications() {
  window.dispatchEvent(new Event(REFRESH_NOTIFICATIONS_EVENT));
}
