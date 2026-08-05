// Theme
export { ThemeProvider, useTheme } from './theme/ThemeProvider';
export { createTheme } from './theme/createTheme';
export { wireframe } from './theme/wireframe';
export { wireframeDark } from './theme/wireframeDark';
export { manifest } from './theme/manifest';
export { manifestDark } from './theme/manifestDark';
export { glass } from './theme/glass';
export { glassDark } from './theme/glassDark';
export { wireframeFonts, manifestFonts, systemFonts } from './theme/fonts';
export { withAlpha } from './theme/color';
export type {
  Theme,
  ThemeOverride,
  ThemeColors,
  ThemeSpacing,
  ThemeRadii,
  ThemeBorders,
  ThemeTypography,
  ThemeShadows,
  ThemeMotion,
  ThemeMaterial,
  TextVariant,
  TextVariantName,
  FontFace,
  SpringPreset,
} from './theme/tokens';

// Motion
export { settle, enter, exit } from './motion';

// Overlay
export { OverlayHost, useOverlay } from './overlay/OverlayHost';

// Drag & drop (cross-list / kanban)
export { DragProvider, useDrag } from './dnd/DragProvider';
export type { DragProviderProps, DropResult, DropTarget, ColumnLayout } from './dnd/DragProvider';
export { DragColumn } from './dnd/DragColumn';
export type { DragColumnProps, DragColumnRenderInfo } from './dnd/DragColumn';

// Icons
export { Icon } from './icons/Icon';
export type { IconName, IconProps } from './icons/Icon';

// Primitives
export { Box, useBoxStyle, splitBoxProps, resolveColor, resolveSpace, resolveRadius } from './primitives/Box';
export type { BoxProps, SpaceValue, ColorValue, RadiusValue } from './primitives/Box';
export { Text } from './primitives/Text';
export type { TextProps } from './primitives/Text';
export { Stack, Row, Spacer } from './primitives/Stack';
export type { StackProps } from './primitives/Stack';
export { Pressable } from './primitives/Pressable';
export type { PressableProps } from './primitives/Pressable';
export { GlassSurface, registerGlassBlur } from './primitives/GlassSurface';
export type { GlassSurfaceProps } from './primitives/GlassSurface';
export { DismissKeyboard } from './primitives/DismissKeyboard';
export type { DismissKeyboardProps } from './primitives/DismissKeyboard';

// Components
export { Button } from './components/Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './components/Button';
export { Card } from './components/Card';
export type { CardProps } from './components/Card';
export { Avatar } from './components/Avatar';
export type { AvatarProps } from './components/Avatar';
export { Badge } from './components/Badge';
export type { BadgeProps, BadgeTone } from './components/Badge';
export { Divider } from './components/Divider';
export type { DividerProps } from './components/Divider';
export { Input, TextArea } from './components/Input';
export type { InputProps, TextAreaProps } from './components/Input';
export { FormField } from './components/FormField';
export type { FormFieldProps } from './components/FormField';
export { Checkbox } from './components/Checkbox';
export type { CheckboxProps } from './components/Checkbox';
export { RadioGroup } from './components/Radio';
export type { RadioGroupProps, RadioOption } from './components/Radio';
export { Switch } from './components/Switch';
export type { SwitchProps } from './components/Switch';
export { Select } from './components/Select';
export type { SelectProps, SelectOption } from './components/Select';
export { Expandable } from './components/Expandable';
export type { ExpandableProps } from './components/Expandable';
export { Accordion } from './components/Accordion';
export type { AccordionProps, AccordionItem } from './components/Accordion';
export { InlineEdit } from './components/InlineEdit';
export type { InlineEditProps } from './components/InlineEdit';
export { List, ListItem } from './components/List';
export type { ListProps, ListItemProps } from './components/List';
export { DraggableList } from './components/DraggableList';
export type { DraggableListProps, DraggableRenderInfo } from './components/DraggableList';
export { Table } from './components/Table';
export type { TableProps, TableColumn } from './components/Table';
export { EmptyState } from './components/EmptyState';
export type { EmptyStateProps } from './components/EmptyState';
export { Skeleton, SkeletonRow } from './components/Skeleton';
export type { SkeletonProps } from './components/Skeleton';
export { ProgressBar } from './components/ProgressBar';
export type { ProgressBarProps } from './components/ProgressBar';
export { Header } from './components/Header';
export type { HeaderProps } from './components/Header';
export { TabBar } from './components/TabBar';
export type { TabBarProps, TabItem } from './components/TabBar';
export { BottomSheet } from './components/BottomSheet';
export type { BottomSheetProps } from './components/BottomSheet';
export { Modal } from './components/Modal';
export type { ModalProps } from './components/Modal';
export { ToastProvider, useToast } from './components/Toast';
export type { ToastTone } from './components/Toast';
export { Filter } from './components/Filter';
export type { FilterProps, FilterOption } from './components/Filter';

// Flows — full journeys (auth, billing, …) built from the components above.
// Backends plug in through FlowServicesProvider; createMockClients() powers
// prototypes and the Storybook demos.
export { FlowServicesProvider, useFlowServices } from './flows/FlowServices';
export type { FlowServicesProviderProps } from './flows/FlowServices';
export { createMockClients, MOCK_CODE } from './flows/clients/mock';
export type { MockClientsOptions } from './flows/clients/mock';
export { createSupabaseClients } from './flows/clients/supabase';
export type { SupabaseClientsOptions, SupabaseLike } from './flows/clients/supabase';
export { FlowError } from './flows/clients/types';
export type {
  FlowClients,
  FlowUser,
  FlowSession,
  AuthClient,
  ProfileClient,
  BillingClient,
  BillingTier,
  Entitlement,
} from './flows/clients/types';
export { StepTransition, useSteps } from './flows/StepTransition';
export type { StepTransitionProps, StepDirection } from './flows/StepTransition';
export { CodeInput } from './flows/components/CodeInput';
export type { CodeInputProps } from './flows/components/CodeInput';
export { AuthFlow } from './flows/auth/AuthFlow';
export type { AuthFlowProps, AuthStep } from './flows/auth/AuthFlow';
export { PaywallScreen } from './flows/billing/PaywallScreen';
export type { PaywallScreenProps } from './flows/billing/PaywallScreen';
export { ManageSubscriptionScreen } from './flows/billing/ManageSubscriptionScreen';
export type { ManageSubscriptionScreenProps } from './flows/billing/ManageSubscriptionScreen';
export { SettingsFlow } from './flows/settings/SettingsFlow';
export type { SettingsFlowProps, SettingsStep } from './flows/settings/SettingsFlow';
export {
  ForceUpgradeScreen,
  MaintenanceScreen,
  OfflineBanner,
} from './flows/ops/OpsScreens';
export type {
  ForceUpgradeScreenProps,
  MaintenanceScreenProps,
  OfflineBannerProps,
} from './flows/ops/OpsScreens';
export { LegalConsentScreen, TrackingConsentScreen } from './flows/legal/LegalScreens';
export type {
  LegalConsentScreenProps,
  TrackingConsentScreenProps,
} from './flows/legal/LegalScreens';
export { WhatsNewScreen, RatePrompt } from './flows/engagement/EngagementScreens';
export type {
  WhatsNewScreenProps,
  WhatsNewHighlight,
  RatePromptProps,
} from './flows/engagement/EngagementScreens';
export { SupportFlow } from './flows/support/SupportFlow';
export type { SupportFlowProps, SupportTicket, FaqItem } from './flows/support/SupportFlow';
export { ReferralScreen } from './flows/referral/ReferralScreen';
export type { ReferralScreenProps } from './flows/referral/ReferralScreen';
export { OnboardingFlow } from './flows/onboarding/OnboardingFlow';
export type {
  OnboardingFlowProps,
  OnboardingSlide,
  OnboardingProfile,
  OnboardingPermission,
} from './flows/onboarding/OnboardingFlow';
