// src/services/api/features/notificationService.ts

export type Notification = {
    id: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
  };
  
  const mockNotifications: Notification[] = [
    {
      id: "1",
      title: "Welcome",
      message: "Welcome to the dashboard!",
      read: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      title: "System Update",
      message: "We’ve updated your settings.",
      read: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: "3",
      title: "Reminder",
      message: "Your subscription will expire in 3 days.",
      read: true,
      createdAt: new Date().toISOString(),
    },
  ];
  
  export const notificationService = {
    getAll: async (): Promise<Notification[]> => {
      return new Promise(resolve => {
        setTimeout(() => resolve([...mockNotifications]), 300);
      });
    },
  
    markAsRead: async (id: string): Promise<boolean> => {
      return new Promise(resolve => {
        setTimeout(() => {
          const notif = mockNotifications.find(n => n.id === id);
          if (notif) notif.read = true;
          resolve(!!notif);
        }, 200);
      });
    },
  
    clearAll: async (): Promise<boolean> => {
      return new Promise(resolve => {
        setTimeout(() => {
          mockNotifications.forEach(n => (n.read = true));
          resolve(true);
        }, 200);
      });
    },
  };
  