import { colors } from "./theme";
export const INBOX_DATA = [
  {
    id: "1",
    sender: "GitHub",
    message: "Dependabot alert: update your packages.",
  },
  {
    id: "2",
    sender: "Hackathon Organizers",
    message: "Pizza has arrived in the lobby!",
  },
  {
    id: "3",
    sender: "Zynyo",
    message: "Please sign the document.",
  },
  {
    id: "4",
    sender: "Vercel",
    message: "Your deployment 'zynyo-inbox-app-xyz' is ready.",
  },
  {
    id: "5",
    sender: "Slack",
    message: "You have a new message from John Doe.",
  },
  { id: "6", sender: "Jira", message: "TICKET-123 has been updated." },
  {
    id: "7",
    sender: "Figma",
    message: "Jane shared a new design file with you.",
  },
  {
    id: "8",
    sender: "Google Calendar",
    message: "Reminder: Team Standup in 15 minutes.",
  },
  {
    id: "9",
    sender: "Notion",
    message: "A page was shared with you: 'Project Phoenix Specs'.",
  },
  {
    id: "10",
    sender: "Linear",
    message: "New issue assigned to you: 'Fix login button'.",
  },
  { id: "11", sender: "Sentry", message: "New error detected in production." },
  {
    id: "12",
    sender: "Stripe",
    message: "Your monthly payout has been processed.",
  },
  {
    id: "13",
    sender: "Miro",
    message: "You were mentioned on the 'Q4 Planning' board.",
  },
  {
    id: "14",
    sender: "Zoom",
    message: "Your meeting '1:1 with Sarah' is starting now.",
  },
  {
    id: "15",
    sender: "AWS",
    message:
      "Billing Alert: Your estimated charges have exceeded the threshold.",
  },
  {
    id: "16",
    sender: "DocuSign",
    message: "Completed: Please review the signed document.",
  },
  {
    id: "17",
    sender: "Expo",
    message: "A new build for your project is available.",
  },
  {
    id: "18",
    sender: "OpenAI",
    message: "Your API usage for the month is approaching its limit.",
  },
];

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
    title: "Account",
    data: [
      {
        id: "profile",
        label: "Profile & Name",
        icon: "person-outline",
        type: "link",
      },
      {
        id: "aliases",
        label: "Email Aliases",
        icon: "mail-outline",
        type: "link",
      },
      {
        id: "signature",
        label: "Signature",
        icon: "create-outline",
        type: "link",
      },
    ],
  },
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
        id: "theme",
        label: "Theme",
        icon: "color-palette-outline",
        type: "value",
        value: "System",
      },
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
