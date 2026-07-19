import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { TabBar } from '../components/TabBar';
import { Text } from '../primitives/Text';
import { Stack } from '../primitives/Stack';

type TabKey = 'home' | 'search' | 'stats' | 'me';

const tabs = [
  { key: 'home' as const, label: 'Home', icon: 'home' as const },
  { key: 'search' as const, label: 'Search', icon: 'search' as const },
  { key: 'stats' as const, label: 'Stats', icon: 'chart' as const },
  { key: 'me' as const, label: 'Me', icon: 'smile' as const },
];

const meta = {
  title: 'Components/TabBar',
  component: TabBar<TabKey>,
  args: {
    active: 'home',
    tabs,
    onChange: () => {},
  },
  argTypes: {
    active: { control: 'inline-radio', options: ['home', 'search', 'stats', 'me'] },
    tabs: { control: false },
    onChange: { control: false },
  },
} satisfies Meta<typeof TabBar<TabKey>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => {
    const [tab, setTab] = useState<TabKey>(args.active);
    return (
      <Stack gap="lg">
        <TabBar active={tab} onChange={setTab} tabs={tabs} />
        <Text align="center" color="inkMuted">
          Active: {tab}
        </Text>
      </Stack>
    );
  },
};
