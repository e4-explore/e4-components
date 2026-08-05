import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { ThemeProvider } from '../theme/ThemeProvider';
import { glass } from '../theme/glass';
import { glassDark } from '../theme/glassDark';
import { GlassSurface } from '../primitives/GlassSurface';
import { Card } from '../components/Card';
import { TabBar } from '../components/TabBar';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { Stack, Row } from '../primitives/Stack';
import type { Theme } from '../theme/tokens';

const meta = {
  title: 'Components/Glass',
  parameters: {
    // The showcase paints its own backdrop and provides its own theme, so it
    // reads correctly under any toolbar selection.
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const BACKDROP_LIGHT =
  'radial-gradient(120% 90% at 12% 8%, #ffd9a8 0%, rgba(255,217,168,0) 45%),' +
  'radial-gradient(120% 90% at 88% 12%, #a8d5ff 0%, rgba(168,213,255,0) 42%),' +
  'radial-gradient(130% 100% at 70% 95%, #d9b8ff 0%, rgba(217,184,255,0) 46%),' +
  'linear-gradient(135deg, #eef2f8 0%, #dfe7f2 100%)';
const BACKDROP_DARK =
  'radial-gradient(120% 90% at 10% 6%, #3a2a5e 0%, rgba(58,42,94,0) 45%),' +
  'radial-gradient(120% 90% at 90% 14%, #0f3b5e 0%, rgba(15,59,94,0) 44%),' +
  'radial-gradient(130% 100% at 72% 96%, #5e1f3a 0%, rgba(94,31,58,0) 48%),' +
  'linear-gradient(135deg, #0b0b12 0%, #14141f 100%)';

/** A gradient stage + glass theme, so panels have real hues to refract. */
function Stage({ theme, backdrop, children }: { theme: Theme; backdrop: string; children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <Box p="lg" style={{ backgroundImage: backdrop, minHeight: 360 } as never} gap="md">
        {children}
      </Box>
    </ThemeProvider>
  );
}

function Panel() {
  return (
    <Stack gap="md">
      <Card>
        <Text variant="heading">Liquid Glass</Text>
        <Text color="inkMuted">
          Translucent surface that blurs and saturates the color behind it, with a
          hairline specular edge. Drag the story column over the gradient to see it
          refract.
        </Text>
        <Row gap="sm" style={{ marginTop: 12 }}>
          <Badge label="Blurred" tone="accent" />
          <Badge label="Saturated" tone="success" />
        </Row>
      </Card>

      <Row gap="md">
        {(['thin', 'regular', 'thick'] as const).map((weight) => (
          <GlassSurface
            key={weight}
            intensity={weight}
            style={{ flex: 1, borderRadius: 16, padding: 16, overflow: 'hidden' }}
          >
            <Text variant="label">{weight}</Text>
            <Text variant="caption" color="inkMuted">
              blur
            </Text>
          </GlassSurface>
        ))}
      </Row>

      <Row gap="sm">
        <Button label="Primary" onPress={() => {}} />
        <Button label="Ghost" variant="ghost" onPress={() => {}} />
      </Row>

      <TabBar
        tabs={[
          { key: 'home', label: 'Home', icon: 'home' },
          { key: 'search', label: 'Search', icon: 'search' },
          { key: 'you', label: 'You', icon: 'smile' },
        ]}
        active="home"
        onChange={() => {}}
      />
    </Stack>
  );
}

/** Light and dark glass, side by side. */
export const Showcase: Story = {
  render: () => (
    <Row gap="none" wrap style={{ alignItems: 'stretch' }}>
      <Box style={{ flexBasis: 380, flexGrow: 1 }}>
        <Stage theme={glass} backdrop={BACKDROP_LIGHT}>
          <Panel />
        </Stage>
      </Box>
      <Box style={{ flexBasis: 380, flexGrow: 1 }}>
        <Stage theme={glassDark} backdrop={BACKDROP_DARK}>
          <Panel />
        </Stage>
      </Box>
    </Row>
  ),
};
