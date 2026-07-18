import React from 'react';
import { Box, type BoxProps, type SpaceValue } from './Box';

export interface StackProps extends BoxProps {
  gap?: SpaceValue;
}

/** Vertical flow with consistent gap. */
export function Stack({ gap = 'md', ...rest }: StackProps) {
  return <Box gap={gap} {...rest} />;
}

/** Horizontal flow, centered on the cross axis by default. */
export function Row({ gap = 'sm', align = 'center', ...rest }: StackProps) {
  return <Box row gap={gap} align={align} {...rest} />;
}

/** Flexible gap-filler for Rows ("push the rest to the far side"). */
export function Spacer({ flex = 1, ...rest }: BoxProps) {
  return <Box flex={flex} {...rest} />;
}
