export const parseNotificationPayload = (payload = {}) => {
  const results = Array.isArray(payload.results)
    ? payload.results
    : Array.isArray(payload.notifications)
      ? payload.notifications
      : Array.isArray(payload)
        ? payload
        : [];

  const countRaw = payload.count ?? payload.total ?? payload.total_count;
  const count = Number.isFinite(countRaw) ? countRaw : results.length;

  const unreadRaw = payload.unread ?? payload.unread_count ?? payload.unreadCount;
  const unread = Number.isFinite(unreadRaw)
    ? unreadRaw
    : results.filter((item) => !item.is_read).length;

  return { results, count, unread };
};
