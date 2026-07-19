import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Button } from '../components/Button';
import { Row } from '../primitives/Stack';
import { useToast } from '../components/Toast';

// Toast is imperative (fired via the useToast() hook), so there are no props to
// drive from Controls — these buttons trigger each tone.
const meta: Meta = { title: 'Components/Toast' };
export default meta;

export const Tones: StoryObj = {
  render: () => {
    const toast = useToast();
    return (
      <Row wrap>
        <Button label="Neutral" variant="secondary" onPress={() => toast.show('Sketch saved')} />
        <Button
          label="Success"
          variant="secondary"
          onPress={() => toast.show('Round synced!', { tone: 'success' })}
        />
        <Button
          label="Danger"
          variant="secondary"
          onPress={() => toast.show('Connection lost', { tone: 'danger' })}
        />
      </Row>
    );
  },
};
