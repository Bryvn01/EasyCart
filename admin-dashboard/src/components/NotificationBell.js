import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { notificationService } from '../services/api';

const POLL_INTERVAL = 30000;

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [locallyReadIds, setLocallyReadIds] = useState(new Set());
  const dropdownRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await notificationService.getNotifications(1);
      const payload = response.data || {};
      const latest = Array.isArray(payload.results) ? payload.results.slice(0, 10) : [];
      setNotifications(latest);
      setUnreadCount(typeof payload.unread === 'number' ? payload.unread : 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const visibleNotifications = useMemo(() => (
    notifications.map((item) => ({
      ...item,
      isRead: locallyReadIds.has(item.id)
    }))
  ), [notifications, locallyReadIds]);

  const handleMarkAsRead = async (notificationId) => {
    if (locallyReadIds.has(notificationId)) return;

    setLocallyReadIds((prev) => new Set(prev).add(notificationId));
    setUnreadCount((prev) => Math.max(prev - 1, 0));

    try {
      await notificationService.markAsRead(notificationId);
    } catch (error) {
      console.warn('Mark-as-read endpoint unavailable, using local read state only.');
      toast('Notification marked as read locally');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            <span className="text-xs text-gray-500">{unreadCount} unread</span>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-6 text-sm text-gray-500">Loading notifications...</div>
            ) : visibleNotifications.length === 0 ? (
              <div className="px-4 py-6 text-sm text-gray-500">No notifications yet.</div>
            ) : (
              visibleNotifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleMarkAsRead(notification.id)}
                  className={`w-full border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                    notification.isRead ? 'bg-white' : 'bg-blue-50'
                  }`}
                >
                  <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                  <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                    <span>Order #{notification.order_id}</span>
                    <span>{new Date(notification.created_at).toLocaleString()}</span>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="border-t border-gray-100 px-4 py-3">
            <Link
              to="/admin/notifications"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
              onClick={() => setIsOpen(false)}
            >
              View all
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
