import { colors } from "./theme";
export interface InboxItem {
  id: string;
  sender: string;
  message: string;
  state: string;
  description: string;
  date: number;
  formattedDate: string;
  signatoryId?: string;
  userHasSigned?: boolean;
  userRole?: string;
  signatoryState?: string;
}

export const INBOX_DATA: InboxItem[] = [];

export type SettingsItem = {
  id: string;
  label: string;
  icon: string;
  type: "link" | "toggle" | "value" | "action";
  value?: string | boolean;
  color?: string; // Marks color as optional
  href?: any;
};

export type SettingsSection = {
  title: string;
  data: SettingsItem[];
};

export const SETTINGS_SECTIONS: SettingsSection[] = [

  {
    title: "Notifications",
    data: [
      {
        id: "push",
        label: "Push Notifications",
        icon: "notifications-outline",
        type: "toggle",
        value: true,
      },
      {
        id: "badges",
        label: "App Icon Badges",
        icon: "alert-circle-outline",
        type: "toggle",
        value: true,
      },
      {
        id: "dnd",
        label: "Do Not Disturb",
        icon: "moon-outline",
        type: "link",
      },
    ],
  },
  {
    title: "Appearance & Behavior",
    data: [
      {
        id: "swipe",
        label: "Swipe Actions",
        icon: "swap-horizontal-outline",
        type: "link",
      },
      {
        id: "density",
        label: "Inbox Density",
        icon: "list-outline",
        type: "value",
        value: "Comfortable",
      },
    ],
  },
  {
    title: "About",
    data: [
      {
        id: "help",
        label: "Help & Support",
        icon: "help-circle-outline",
        type: "link",
      },
      {
        id: "version",
        label: "App Version",
        icon: "information-circle-outline",
        type: "value",
        value: "1.0.0",
      },
      {
        id: "logout",
        label: "Log Out",
        icon: "log-out-outline",
        type: "action",
        color: colors.destructive,
      },
    ],
  },
];
