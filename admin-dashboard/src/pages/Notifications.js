import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { notificationService } from '../services/api';

const STATUS_OPTIONS = ['all', 'processing', 'completed'];
const DEFAULT_PAGE_SIZE = 10;

const Notifications = () => {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [unread, setUnread] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [markingAll, setMarkingAll] = useState(false);
  const [markingIds, setMarkingIds] = useState(new Set());
  const [locallyReadIds, setLocallyReadIds] = useState(new Set());

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter === 'all' ? {} : { order_status: statusFilter };
      const response = await notificationService.getNotifications(page, params);
      const payload = response.data || {};
      const results = Array.isArray(payload.results) ? payload.results : [];
      setNotifications(results);
      setCount(payload.count || 0);
      setUnread(payload.unread || 0);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast.error('Failed to load notifications');
      setNotifications([]);
      setCount(0);
      setUnread(0);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const displayedNotifications = useMemo(
    () => notifications.map((item) => ({ ...item, isRead: Boolean(item.is_read) || locallyReadIds.has(item.id) })),
    [notifications, locallyReadIds]
  );

  const totalPages = Math.max(1, Math.ceil(count / DEFAULT_PAGE_SIZE));
  const hasNext = page < totalPages;
  const hasPrevious = page > 1;

  const handleMarkAsRead = async (notificationId) => {
    if (locallyReadIds.has(notificationId)) return;

    setMarkingIds((prev) => new Set(prev).add(notificationId));
    try {
      await notificationService.markAsRead(notificationId);
      setLocallyReadIds((prev) => new Set(prev).add(notificationId));
      setUnread((prev) => Math.max(prev - 1, 0));
      toast.success('Notification marked as read');
    } catch (error) {
      toast.error('Could not mark notification as read');
    } finally {
      setMarkingIds((prev) => {
        const next = new Set(prev);
        next.delete(notificationId);
        return next;
      });
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await notificationService.markAllRead();
      setLocallyReadIds((prev) => {
        const next = new Set(prev);
        notifications.forEach((item) => next.add(item.id));
        return next;
      });
      setUnread(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Could not mark all notifications as read');
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-gray-600">Track and manage staff order notifications</p>
        </div>
        <button
          type="button"
          onClick={handleMarkAllRead}
          disabled={markingAll || unread === 0}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {markingAll ? 'Marking...' : 'Mark all read'}
        </button>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-gray-600">
          Total: <span className="font-semibold">{count}</span> · Unread: <span className="font-semibold">{unread}</span>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="statusFilter" className="text-sm text-gray-600">Filter status:</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Message</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Order</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Created</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">Loading notifications...</td>
              </tr>
            ) : displayedNotifications.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">No notifications found.</td>
              </tr>
            ) : (
              displayedNotifications.map((notification) => (
                <tr key={notification.id} className={notification.isRead ? '' : 'bg-blue-50/40'}>
                  <td className="px-4 py-3 text-sm text-gray-900">{notification.message}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">#{notification.order_id}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      notification.order_status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {notification.order_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(notification.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      type="button"
                      onClick={() => handleMarkAsRead(notification.id)}
                      disabled={notification.isRead || markingIds.has(notification.id)}
                      className="text-blue-600 hover:text-blue-700 disabled:cursor-not-allowed disabled:text-gray-400"
                    >
                      {notification.isRead ? 'Read' : markingIds.has(notification.id) ? 'Marking...' : 'Mark read'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={!hasPrevious || loading}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => setPage((prev) => prev + 1)}
          disabled={!hasNext || loading}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Notifications;
