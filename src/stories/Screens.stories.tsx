import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Stack, Row, Spacer } from '../primitives/Stack';
import { Text } from '../primitives/Text';
import { Box } from '../primitives/Box';
import { Header } from '../components/Header';
import { TabBar } from '../components/TabBar';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { InlineEdit } from '../components/InlineEdit';
import { DraggableList } from '../components/DraggableList';
import { ProgressBar } from '../components/ProgressBar';
import { Divider } from '../components/Divider';
import { Icon } from '../icons/Icon';
import { useToast } from '../components/Toast';
import { useTheme } from '../theme/ThemeProvider';

const meta: Meta = { title: 'Examples/Full screen' };
export default meta;

export const TrainingPlan: StoryObj = {
  render: () => {
    const theme = useTheme();
    const toast = useToast();
    const [tab, setTab] = useState<'plan' | 'stats' | 'me'>('plan');
    const [title, setTitle] = useState('Saturday practice');
    const [drills, setDrills] = useState([
      { id: 'a', title: 'Putting ladder', detail: '10 min' },
      { id: 'b', title: 'Wedge distance control', detail: '20 min' },
      { id: 'c', title: 'Driver tempo', detail: '15 min' },
      { id: 'd', title: 'Approach shots', detail: '25 min' },
    ]);
    const done = 1;

    return (
      <Box
        bg="background"
        style={{
          height: 640,
          borderWidth: theme.borders.thick,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.lg,
          overflow: 'hidden',
        }}
      >
        <Header
          title="Training"
          right={<Avatar name="Ethan Grove" size={32} />}
        />
        <Box flex={1} p="md" gap="md">
          <Card>
            <Stack gap="sm">
              <Row>
                <InlineEdit value={title} onCommit={setTitle} variant="heading" />
                <Spacer />
                <Badge label="Today" tone="accent" />
              </Row>
              <ProgressBar progress={done / drills.length} label="Session progress" showValue />
            </Stack>
          </Card>
          <Row>
            <Text variant="label" color="inkMuted">
              Drills — hold & drag to reorder
            </Text>
            <Spacer />
            <Button label="✚" size="sm" variant="ghost" onPress={() => toast.show('Add drill')} />
          </Row>
          <DraggableList
            data={drills}
            keyExtractor={(d) => d.id}
            onReorder={setDrills}
            rowHeight={64}
            maxHeight={256}
            renderItem={({ item, isActive }) => (
              <Box pb="sm" style={{ height: 64 }}>
                <Card flat={!isActive} p="sm" px="md" style={{ flex: 1, justifyContent: 'center' }}>
                  <Row>
                    <Icon name="grip" size={16} color="inkFaint" />
                    <Box flex={1} ml="sm">
                      <Text variant="label" weight="medium">{item.title}</Text>
                    </Box>
                    <Text variant="caption" color="inkMuted">{item.detail}</Text>
                  </Row>
                </Card>
              </Box>
            )}
          />
        </Box>
        <TabBar
          active={tab}
          onChange={setTab}
          tabs={[
            { key: 'plan', label: 'Plan', icon: 'edit' },
            { key: 'stats', label: 'Stats', icon: 'chart' },
            { key: 'me', label: 'Me', icon: 'smile' },
          ]}
        />
      </Box>
    );
  },
};
