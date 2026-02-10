import React, { useState } from 'react';
import { Box, ToggleButtonGroup, ToggleButton, Typography } from '@mui/material';
import {
  DesktopWindows as DesktopIcon,
  TabletMac as TabletIcon,
  PhoneIphone as MobileIcon,
} from '@mui/icons-material';

const devices = [
  { value: 'desktop', label: 'Desktop', icon: <DesktopIcon />, width: '100%' },
  { value: 'tablet', label: 'Tablet', icon: <TabletIcon />, width: 768 },
  { value: 'mobile', label: 'Mobile', icon: <MobileIcon />, width: 375 },
] as const;

interface DevicePreviewFrameProps {
  children: React.ReactNode;
}

export function DevicePreviewFrame({ children }: DevicePreviewFrameProps) {
  const [device, setDevice] = useState<string>('desktop');
  const active = devices.find((d) => d.value === device) || devices[0];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <ToggleButtonGroup
          size="small"
          value={device}
          exclusive
          onChange={(_, v) => v && setDevice(v)}
        >
          {devices.map((d) => (
            <ToggleButton key={d.value} value={d.value} sx={{ gap: 0.5, textTransform: 'none' }}>
              {d.icon}
              <Typography variant="caption">{d.label}</Typography>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
      <Box
        sx={{
          maxWidth: active.width,
          mx: 'auto',
          border: device !== 'desktop' ? 2 : 0,
          borderColor: 'divider',
          borderRadius: device !== 'desktop' ? 3 : 0,
          p: device !== 'desktop' ? 2 : 0,
          bgcolor: device !== 'desktop' ? 'background.default' : 'transparent',
          transition: 'all 0.3s ease',
          overflow: 'hidden',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
