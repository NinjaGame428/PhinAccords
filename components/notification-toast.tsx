"use client";

import { useState, useEffect } from "react";
import { useNotifications } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

export function NotificationToast() {
  const { notifications, markAsRead, removeNotification } = useNotifications();
  const [visibleNotifications, setVisibleNotifications] = useState<string[]>([]);

  useEffect(() => {
    // Show new notifications
    const newNotifications = notifications
      .filter(n => !visibleNotifications.includes(n.id))
      .slice(0, 3); // Show max 3 at a time
    
    if (newNotifications.length > 0) {
      setVisibleNotifications(prev => [
        ...newNotifications.map(n => n.id),
        ...prev.slice(0, 2) // Keep max 3 total
      ]);
    }
  }, [notifications, visibleNotifications]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'info': return 'bg-blue-50 border-blue-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const handleClose = (id: string) => {
    setVisibleNotifications(prev => prev.filter(n => n !== id));
    removeNotification(id);
  };

  const handleClick = (notification: any) => {
    markAsRead(notification.id);
    setVisibleNotifications(prev => prev.filter(n => n !== notification.id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications
        .filter(n => visibleNotifications.includes(n.id))
        .map((notification) => (
          <Card 
            key={notification.id}
            className={`w-80 shadow-lg cursor-pointer transition-all duration-300 ${getBgColor(notification.type)}`}
            onClick={() => handleClick(notification)}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                {getIcon(notification.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClose(notification.id);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {notification.timestamp.toLocaleTimeString()}
                    </span>
                    {!notification.read && (
                      <Badge variant="secondary" className="text-xs">
                        New
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
