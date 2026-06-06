// TODO: Gmail integration — not yet implemented.
// When gmail_thread_id is present on an outreach_emails row, this function
// should call the Gmail API to inspect the thread for replies and
// auto-update the email status accordingly.
//
// GMAIL HOOK: Manual status updates via PATCH /api/outreach-emails/[id]
// should set a `manually_overridden: true` flag (future column) so this
// sync job does not revert user-set statuses.

export async function syncEmailStatus(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _gmailThreadId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _emailId: string
): Promise<void> {
  // TODO: implement Gmail OAuth flow, fetch thread, detect replies,
  // call updateOutreachEmail() with new status.
  throw new Error("Gmail sync is not yet implemented.");
}
