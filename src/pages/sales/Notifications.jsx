import { useState } from "react";
import { Bell, CheckCircle2, Circle, X } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import StatsCard from "../../components/StatsCard";

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New lead assigned",
      message: "You have been assigned a new lead: Kavya Nair",
      type: "info",
      read: false,
      timestamp: new Date(),
    },
    {
      id: 2,
      title: "Assessment completed",
      message: "Vikram Rao has completed the technical assessment",
      type: "success",
      read: false,
      timestamp: new Date(Date.now() - 3600000),
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const totalCount = notifications.length;

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Stay updated with important sales activities and updates."
        actions={
          <Button 
            variant="ghost" 
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            Mark All Read
          </Button>
        }
      />

      <div className="grid gap-5 md:grid-cols-3">
        <StatsCard 
          icon={Bell} 
          value={totalCount} 
          label="Total Notifications" 
          trend="All time" 
        />
        <StatsCard icon={Circle} value={unreadCount} label="Unread" trend="Needs attention" />
        <StatsCard icon={CheckCircle2} value={totalCount - unreadCount} label="Read" trend="Viewed" />
      </div>

      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft">
        <div className="flex items-center justify-between border-b border-brintelli-border p-4">
          <h3 className="text-lg font-semibold text-text">Notifications</h3>
        </div>
        <div className="p-4">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-textMuted">
              <Bell className="h-12 w-12 mx-auto mb-4 text-textMuted" />
              <p>No notifications yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-4 transition ${
                    !notification.read ? 'border-brand-300 bg-brand-50/10' : ''
                  }`}
                >
                  <div className={`mt-1 h-2 w-2 rounded-full ${
                    !notification.read ? 'bg-brand-500' : 'bg-transparent'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className={`font-semibold ${!notification.read ? 'text-text' : 'text-textMuted'}`}>
                          {notification.title}
                        </h4>
                        <p className="mt-1 text-sm text-textMuted">{notification.message}</p>
                        <p className="mt-2 text-xs text-textMuted">
                          {notification.timestamp.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="h-8 w-8 p-0"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Notifications;

