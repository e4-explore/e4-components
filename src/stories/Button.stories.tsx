import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Button } from '../components/Button';
import { Stack, Row } from '../primitives/Stack';
import { useToast } from '../components/Toast';

const meta = {
  title: 'Components/Button',
  component: Button,
  args: {
    label: 'Press me',
    variant: 'primary',
    size: 'md',
    loading: false,
    disabled: false,
    block: false,
  },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'danger'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    icon: {
      control: 'select',
      options: [undefined, 'chevronLeft', 'chevronRight', 'chevronDown', 'check', 'close', 'grip', 'home', 'search', 'chart', 'smile', 'edit'],
    },
    left: { control: false },
    right: { control: false },
    onPress: { control: false },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => {
    const toast = useToast();
    return <Button {...args} onPress={() => toast.show('Pressed!')} />;
  },
};

export const Variants: Story = {
  render: () => (
    <Stack>
      <Row>
        <Button label="Primary" variant="primary" />
        <Button label="Secondary" variant="secondary" />
      </Row>
      <Row>
        <Button label="Ghost" variant="ghost" />
        <Button label="Danger" variant="danger" />
      </Row>
      <Row>
        <Button label="Small" size="sm" variant="secondary" />
        <Button label="Large" size="lg" />
      </Row>
      <Button label="Loading…" loading />
      <Button label="Disabled" disabled />
      <Button label="Block button" block />
      <Button label="With icon" icon="check" variant="secondary" />
      <Button label="With glyphs" variant="secondary" left={<>✚</>} right={<>›</>} />
    </Stack>
  ),
};
