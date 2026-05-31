"use client";

import React, { useState } from "react";
import {
  Popover,
  Typography,
  IconButton,
  useTheme,
  Box,
  Badge,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useNotifications } from "./NotificationContext";

const NotificationButton = () => {
  const { notifications, clearNotifications } = useNotifications() as {
    notifications: string[];
    clearNotifications: () => void;
  };
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    clearNotifications(); // 👉 lösche Benachrichtigungen direkt beim Öffnen
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge
          badgeContent={notifications.length}
          color="error"
          overlap="circular"
          invisible={notifications.length === 0}
        >
          <NotificationsIcon sx={{ color: theme.palette.text.primary }} />
        </Badge>
      </IconButton>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Box sx={{ p: 2, width: 250 }}>
          {notifications.length === 0 ? (
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              No notifications
            </Typography>
          ) : (
            notifications.map((notification, index) => (
              <Typography
                key={`${notification}-${index}`}
                variant="body2"
                sx={{ mb: 1, color: theme.palette.text.primary }}
              >
                {notification}
              </Typography>
            ))
          )}
        </Box>
      </Popover>
    </>
  );
};

export default NotificationButton;
