import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Stack, Row } from '../primitives/Stack';
import { Text } from '../primitives/Text';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Divider } from '../components/Divider';
import { useTheme } from '../theme/ThemeProvider';

const meta: Meta = { title: 'Welcome' };
export default meta;

const SWATCH_LABELS: Partial<Record<string, string>> = { background: 'bg' };

export const Start: StoryObj = {
  parameters: { options: { showPanel: false } },
  render: () => {
    const theme = useTheme();
    return (
      <Stack gap="lg">
        <Stack gap="xs">
          <Text variant="display">e4-components</Text>
          <Text color="inkMuted">
            Wireframe on the surface, flagship-app feel underneath. Every visual value comes from
            a theme token — use the 🖌 toolbar above to flip this whole catalog from
            ✏️ wireframe to a 🎨 branded theme without touching a component.
          </Text>
        </Stack>
        <Divider label="current theme" />
        <Card>
          <Stack gap="sm">
            <Row>
              <Text variant="heading">{theme.name}</Text>
              <Badge label={theme.borders.sketchStyle} />
            </Row>
            <Row wrap gap="sm">
              {(['background', 'surface', 'surfaceAlt', 'ink', 'inkMuted', 'accent', 'primary'] as const).map(
                (key) => (
                  <Stack key={key} gap="xxs" align="center">
                    <Row
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: theme.radii.sm,
                        borderWidth: theme.borders.regular,
                        borderColor: theme.colors.border,
                        backgroundColor: theme.colors[key],
                      }}
                    />
                    <Text variant="caption" color="inkMuted">
                      {SWATCH_LABELS[key] ?? key}
                    </Text>
                  </Stack>
                ),
              )}
            </Row>
          </Stack>
        </Card>
        <Card flat>
          <Stack gap="xs">
            <Text variant="heading">Start here</Text>
            <Text color="inkMuted">• Components/* — every building block, interactive</Text>
            <Text color="inkMuted">• Examples/Full screen — everything composed together</Text>
            <Text color="inkMuted">• Hold rows to drag, tap text to edit inline</Text>
          </Stack>
        </Card>
      </Stack>
    );
  },
};
