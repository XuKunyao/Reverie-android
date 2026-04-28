/**
 * 设置页 — 极简设置界面
 *
 * 三个设置项：
 * 1. 每日饮水目标（滑动调节，500-4000ml）
 * 2. 单次饮水量（可选 100/150/200/250/300/400/500ml）
 * 3. 提醒间隔（可选 30分/1小时/1.5小时/2小时/3小时，可关闭）
 *
 * 设计原则：
 * - 每个设置项使用卡片包裹
 * - 选项使用柔和的选择芯片（Chip），而非下拉菜单
 * - 温暖的描述文字解释每个设置的含义
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { Theme } from '@/constants/theme';
import { useWater } from '@/contexts/WaterContext';

/** 可选的单次饮水量 */
const CUP_SIZES = [100, 150, 200, 250, 300, 400, 500];

/** 可选的提醒间隔（分钟） */
const INTERVALS = [
  { label: '关闭', value: 0 },
  { label: '30 分钟', value: 30 },
  { label: '1 小时', value: 60 },
  { label: '1.5 小时', value: 90 },
  { label: '2 小时', value: 120 },
  { label: '3 小时', value: 180 },
];

/** 可选的每日目标 */
const DAILY_GOALS = [1000, 1500, 2000, 2500, 3000, 3500, 4000];

type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'high';

const ACTIVITY_LEVELS: {
  value: ActivityLevel;
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  extraMl: number;
}[] = [
  {
    value: 'sedentary',
    title: '久坐办公',
    subtitle: '较少运动',
    icon: 'monitor',
    extraMl: 0,
  },
  {
    value: 'light',
    title: '轻度活动',
    subtitle: '偶尔运动',
    icon: 'wind',
    extraMl: 250,
  },
  {
    value: 'moderate',
    title: '中度活动',
    subtitle: '经常运动',
    icon: 'activity',
    extraMl: 500,
  },
  {
    value: 'high',
    title: '高强度',
    subtitle: '高强度运动',
    icon: 'zap',
    extraMl: 800,
  },
];

/**
 * 选择芯片组件 — 一个可点击的小标签
 * 选中时使用品牌色，未选中时使用浅色背景
 */
function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        chipStyles.chip,
        selected && chipStyles.chipSelected,
      ]}
    >
      <Text
        style={[
          chipStyles.chipText,
          selected && chipStyles.chipTextSelected,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function ActivityCard({
  option,
  selected,
  onPress,
}: {
  option: (typeof ACTIVITY_LEVELS)[number];
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.activityCard,
        selected && styles.activityCardSelected,
        pressed && styles.activityCardPressed,
      ]}
    >
      <Feather
        name={option.icon}
        size={24}
        color={selected ? Theme.colors.surface : Theme.colors.text}
      />
      <Text
        style={[
          styles.activityTitle,
          selected && styles.activityTitleSelected,
        ]}
      >
        {option.title}
      </Text>
      <Text
        style={[
          styles.activitySubtitle,
          selected && styles.activitySubtitleSelected,
        ]}
      >
        {option.subtitle}
      </Text>
    </Pressable>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Theme.colors.background,
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: Theme.colors.primary,
  },
  chipText: {
    fontSize: 14,
    fontFamily: Theme.fonts.medium,
    color: Theme.colors.textSecondary,
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
});

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { state, updateSettings } = useWater();
  const { settings } = state;
  const [customCupSize, setCustomCupSize] = React.useState(String(settings.cupSize));
  const [isGoalModalVisible, setIsGoalModalVisible] = React.useState(false);
  const [weightKg, setWeightKg] = React.useState('60');
  const [activityLevel, setActivityLevel] = React.useState<ActivityLevel>('sedentary');

  React.useEffect(() => {
    setCustomCupSize(String(settings.cupSize));
  }, [settings.cupSize]);

  const parsedCustomCupSize = Number.parseInt(customCupSize, 10);
  const isCustomCupSizeValid =
    Number.isFinite(parsedCustomCupSize) &&
    parsedCustomCupSize > 0;
  const cupSizeOptions = CUP_SIZES.includes(settings.cupSize)
    ? CUP_SIZES
    : [...CUP_SIZES, settings.cupSize];
  const dailyGoalOptions = DAILY_GOALS.includes(settings.dailyGoal)
    ? DAILY_GOALS
    : [...DAILY_GOALS, settings.dailyGoal];

  const parsedWeightKg = Number.parseFloat(weightKg);
  const isWeightValid = Number.isFinite(parsedWeightKg) && parsedWeightKg > 0;
  const selectedActivity = ACTIVITY_LEVELS.find((option) => option.value === activityLevel) ?? ACTIVITY_LEVELS[0];
  const estimatedDailyGoal = isWeightValid
    ? Math.round(((parsedWeightKg * 30) + selectedActivity.extraMl) / 50) * 50
    : 0;
  const cupCountMin = estimatedDailyGoal > 0 ? Math.max(1, Math.floor(estimatedDailyGoal / 250)) : 0;
  const cupCountMax = estimatedDailyGoal > 0 ? Math.max(cupCountMin, Math.ceil(estimatedDailyGoal / 250)) : 0;
  const cupEstimateText = cupCountMin === cupCountMax
    ? `约 ${cupCountMin} 杯水（每杯 250ml）`
    : `约 ${cupCountMin}-${cupCountMax} 杯水（每杯 250ml）`;

  const sanitizeDecimal = (value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, '');
    const [integerPart, ...decimalParts] = cleaned.split('.');
    return decimalParts.length > 0
      ? `${integerPart}.${decimalParts.join('')}`
      : integerPart;
  };

  const calculateDailyGoal = () => {
    if (!isWeightValid) {
      return;
    }

    updateSettings({ dailyGoal: estimatedDailyGoal });
    setIsGoalModalVisible(false);
  };

  const saveCustomCupSize = () => {
    if (isCustomCupSizeValid) {
      updateSettings({ cupSize: parsedCustomCupSize });
    }
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* 页面标题 */}
      <Text style={styles.pageTitle}>设置</Text>

      {/* 每日饮水目标 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>每日饮水目标</Text>
        <Text style={styles.cardDescription}>
          根据体重和活动量，一般建议每天饮水 1.5-2.5 升
        </Text>
        <View style={styles.chipGroup}>
          {dailyGoalOptions.map((goal) => (
            <Chip
              key={goal}
              label={`${goal} ml`}
              selected={settings.dailyGoal === goal}
              onPress={() => updateSettings({ dailyGoal: goal })}
            />
          ))}
        </View>
        <Pressable
          onPress={() => setIsGoalModalVisible(true)}
          style={({ pressed }) => [
            styles.estimateButton,
            pressed && styles.estimateButtonPressed,
          ]}
        >
          <Text style={styles.estimateButtonText}>计算适合我的目标</Text>
        </Pressable>
      </View>

      {/* 单次饮水量 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>单次饮水量</Text>
        <Text style={styles.cardDescription}>
          每次点击“喝了一杯”时记录的水量
        </Text>
        <View style={styles.chipGroup}>
          {cupSizeOptions.map((size) => (
            <Chip
              key={size}
              label={`${size} ml`}
              selected={settings.cupSize === size}
              onPress={() => updateSettings({ cupSize: size })}
            />
          ))}
        </View>
        <View style={styles.customSection}>
          <View style={styles.customCopy}>
            <Text style={styles.customTitle}>自定义杯量：</Text>
          </View>
          <View style={styles.customControl}>
            <View style={styles.customInputShell}>
              <TextInput
                value={customCupSize}
                onChangeText={(value) => setCustomCupSize(value.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                placeholder="250"
                placeholderTextColor={Theme.colors.textSecondary}
                style={styles.customInput}
              />
              <Text style={styles.inputUnit}>ml</Text>
            </View>
            <Pressable
              onPress={saveCustomCupSize}
              disabled={!isCustomCupSizeValid}
              style={({ pressed }) => [
                styles.saveButton,
                pressed && isCustomCupSizeValid && styles.saveButtonPressed,
                !isCustomCupSizeValid && styles.saveButtonDisabled,
              ]}
            >
              <Text
                style={[
                  styles.saveButtonText,
                  !isCustomCupSizeValid && styles.saveButtonTextDisabled,
                ]}
              >
                应用
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* 提醒间隔 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>提醒间隔</Text>
        <Text style={styles.cardDescription}>
          定期收到喝水提醒通知
        </Text>
        <View style={styles.chipGroup}>
          {INTERVALS.map((interval) => {
            const isSelected = interval.value === 0
              ? !settings.reminderEnabled
              : settings.reminderEnabled && settings.reminderInterval === interval.value;
            return (
              <Chip
                key={interval.value}
                label={interval.label}
                selected={isSelected}
                onPress={() => {
                  if (interval.value === 0) {
                    updateSettings({ reminderEnabled: false });
                  } else {
                    updateSettings({
                      reminderEnabled: true,
                      reminderInterval: interval.value,
                    });
                  }
                }}
              />
            );
          })}
        </View>
      </View>

      {/* 关于 */}
      <View style={styles.aboutSection}>
        <Text style={styles.aboutText}>Reverie · 喝水提醒</Text>
        <Text style={styles.aboutVersion}>v1.0.0</Text>
      </View>

      <View style={{ height: 32 }} />

      <Modal
        visible={isGoalModalVisible}
        transparent
        animationType="none"
        onRequestClose={() => setIsGoalModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalRoot}
        >
          <Animated.View
            entering={FadeIn.duration(260)}
            exiting={FadeOut.duration(220)}
            style={styles.modalBackdrop}
          >
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setIsGoalModalVisible(false)}
            />
          </Animated.View>
          <Animated.View
            entering={SlideInDown.duration(340).springify().damping(19).stiffness(170)}
            exiting={SlideOutDown.duration(240)}
            style={[
              styles.modalSheet,
              { paddingBottom: Math.max(insets.bottom + 14, 24) },
            ]}
          >
            <View style={styles.sheetHandle} />
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderCopy}>
                <Text style={styles.modalTitle}>计算适合我的饮水目标</Text>
                <Text style={styles.modalDescription}>
                  根据你的身体数据和生活习惯，推荐每日饮水量
                </Text>
              </View>
              <Pressable
                onPress={() => setIsGoalModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="关闭"
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && styles.closeButtonPressed,
                ]}
              >
                <Feather name="x" size={26} color={Theme.colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              <View style={styles.profileCard}>
                <Text style={styles.profileTitle}>我的身体数据</Text>

                <View style={styles.weightRow}>
                  <View style={styles.weightLabelGroup}>
                    <Feather name="box" size={23} color={Theme.colors.textSecondary} />
                    <Text style={styles.weightLabel}>体重</Text>
                  </View>
                  <View style={styles.weightInputShell}>
                    <TextInput
                      value={weightKg}
                      onChangeText={(value) => setWeightKg(sanitizeDecimal(value))}
                      keyboardType="decimal-pad"
                      placeholder="60"
                      placeholderTextColor={Theme.colors.textSecondary}
                      style={styles.weightInput}
                    />
                    <Text style={styles.weightUnit}>kg</Text>
                  </View>
                </View>
                <Text style={styles.fieldHint}>建议输入实际体重，计算更准确</Text>

                <View style={styles.profileDivider} />

                <View style={styles.activityHeader}>
                  <Feather name="activity" size={23} color={Theme.colors.textSecondary} />
                  <Text style={styles.activityHeaderText}>每日活动量</Text>
                </View>
                <View style={styles.activityGrid}>
                  {ACTIVITY_LEVELS.map((option) => (
                    <ActivityCard
                      key={option.value}
                      option={option}
                      selected={activityLevel === option.value}
                      onPress={() => setActivityLevel(option.value)}
                    />
                  ))}
                </View>

                <View style={styles.resultCard}>
                  <View style={styles.resultCopy}>
                    <Text style={styles.resultTitle}>计算结果</Text>
                    <Text style={styles.resultDescription}>根据你的数据推荐每日饮水量</Text>
                    <View style={styles.resultValueRow}>
                      <Text style={styles.resultValue}>
                        {isWeightValid ? estimatedDailyGoal : '--'}
                      </Text>
                      <Text style={styles.resultUnit}>ml / 天</Text>
                    </View>
                    <View style={styles.cupEstimateRow}>
                      <Feather name="droplet" size={16} color={Theme.colors.textSecondary} />
                      <Text style={styles.cupEstimateText}>
                        {isWeightValid ? cupEstimateText : '请输入体重后查看结果'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.resultIllustration}>
                    <View style={styles.waterGlass}>
                      <View style={styles.waterSurface} />
                    </View>
                    <View style={styles.waterDrop}>
                      <Feather name="droplet" size={30} color={Theme.colors.primary} />
                    </View>
                  </View>
                </View>

                <Pressable
                  onPress={calculateDailyGoal}
                  disabled={!isWeightValid}
                  style={({ pressed }) => [
                    styles.modalPrimaryButton,
                    pressed && isWeightValid && styles.saveButtonPressed,
                    !isWeightValid && styles.saveButtonDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.modalPrimaryText,
                      !isWeightValid && styles.saveButtonTextDisabled,
                    ]}
                  >
                    应用这个目标
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setIsGoalModalVisible(false)}
                  style={({ pressed }) => [
                    styles.modalSecondaryButton,
                    pressed && styles.modalSecondaryButtonPressed,
                  ]}
                >
                  <Text style={styles.modalSecondaryText}>取消</Text>
                </Pressable>
              </View>
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontFamily: Theme.fonts.medium,
    color: Theme.colors.text,
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.card,
    padding: 20,
    marginBottom: 16,
    // 极轻阴影
    elevation: 1,
    shadowColor: '#1A1612',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  cardTitle: {
    fontSize: 17,
    fontFamily: Theme.fonts.medium,
    color: Theme.colors.text,
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    fontFamily: Theme.fonts.regular,
    color: Theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  estimateButton: {
    alignSelf: 'flex-start',
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.radius.button,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.colors.border,
    marginTop: 6,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  estimateButtonPressed: {
    opacity: 0.72,
  },
  estimateButtonText: {
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
  },
  customSection: {
    alignItems: 'flex-start',
    marginTop: 6,
    paddingTop: 4,
  },
  customCopy: {
    marginBottom: 8,
  },
  customTitle: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  customControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customInputShell: {
    width: 90,
    minHeight: 42,
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.radius.input,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  customInput: {
    flex: 1,
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    paddingVertical: 8,
  },
  inputUnit: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radius.button,
    minHeight: 42,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  saveButtonPressed: {
    backgroundColor: Theme.colors.primaryPressed,
  },
  saveButtonDisabled: {
    backgroundColor: Theme.colors.border,
  },
  saveButtonText: {
    color: Theme.colors.surface,
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
  },
  saveButtonTextDisabled: {
    color: Theme.colors.textSecondary,
  },
  aboutSection: {
    alignItems: 'center',
    marginTop: 24,
    paddingVertical: 16,
  },
  aboutText: {
    fontSize: 14,
    fontFamily: Theme.fonts.regular,
    color: Theme.colors.textSecondary,
  },
  aboutVersion: {
    fontSize: 12,
    fontFamily: Theme.fonts.regular,
    color: Theme.colors.border,
    marginTop: 4,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 22, 18, 0.46)',
  },
  modalSheet: {
    maxHeight: '92%',
    backgroundColor: Theme.colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 14,
    elevation: 4,
    shadowColor: '#1A1612',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
  },
  sheetHandle: {
    width: 48,
    height: 7,
    borderRadius: Theme.radius.full,
    backgroundColor: Theme.colors.border,
    alignSelf: 'center',
    marginBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 20,
  },
  modalHeaderCopy: {
    flex: 1,
  },
  modalTitle: {
    color: Theme.colors.text,
    fontFamily: Theme.fonts.medium,
    fontSize: 25,
    lineHeight: 32,
  },
  modalDescription: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 6,
  },
  closeButton: {
    width: 58,
    height: 58,
    borderRadius: Theme.radius.full,
    backgroundColor: '#F1ECE4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonPressed: {
    backgroundColor: Theme.colors.border,
  },
  modalScrollContent: {
    paddingBottom: 2,
  },
  profileCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.colors.border,
    padding: 20,
    elevation: 1,
    shadowColor: '#1A1612',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  profileTitle: {
    color: Theme.colors.text,
    fontFamily: Theme.fonts.medium,
    fontSize: 21,
    lineHeight: 27,
    marginBottom: 22,
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  weightLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  weightLabel: {
    color: Theme.colors.text,
    fontFamily: Theme.fonts.medium,
    fontSize: 17,
  },
  weightInputShell: {
    width: 146,
    minHeight: 62,
    backgroundColor: Theme.colors.background,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  weightInput: {
    flex: 1,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.medium,
    fontSize: 20,
    paddingVertical: 10,
  },
  weightUnit: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.medium,
    fontSize: 16,
  },
  fieldHint: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 14,
  },
  profileDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Theme.colors.border,
    marginVertical: 24,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  activityHeaderText: {
    color: Theme.colors.text,
    fontFamily: Theme.fonts.medium,
    fontSize: 17,
  },
  activityGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  activityCard: {
    flex: 1,
    minHeight: 130,
    minWidth: 0,
    backgroundColor: Theme.colors.background,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  activityCardSelected: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  activityCardPressed: {
    opacity: 0.82,
  },
  activityTitle: {
    color: Theme.colors.text,
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 14,
  },
  activityTitleSelected: {
    color: Theme.colors.surface,
  },
  activitySubtitle: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 6,
  },
  activitySubtitleSelected: {
    color: Theme.colors.surface,
  },
  resultCard: {
    minHeight: 164,
    backgroundColor: '#FBF2E7',
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.colors.border,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  resultCopy: {
    flex: 1,
    zIndex: 1,
  },
  resultTitle: {
    color: Theme.colors.text,
    fontFamily: Theme.fonts.medium,
    fontSize: 19,
    lineHeight: 25,
  },
  resultDescription: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  resultValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 14,
  },
  resultValue: {
    color: Theme.colors.text,
    fontFamily: Theme.fonts.medium,
    fontSize: 50,
    lineHeight: 56,
  },
  resultUnit: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.medium,
    fontSize: 18,
    lineHeight: 28,
    marginLeft: 8,
    marginBottom: 5,
  },
  cupEstimateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  cupEstimateText: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  resultIllustration: {
    width: 96,
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  waterGlass: {
    width: 72,
    height: 82,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: '#DDC9B3',
    backgroundColor: 'rgba(253, 250, 244, 0.72)',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  waterSurface: {
    height: 35,
    backgroundColor: 'rgba(142, 174, 190, 0.28)',
  },
  waterDrop: {
    position: 'absolute',
    right: 0,
    bottom: 12,
    width: 54,
    height: 54,
    borderRadius: Theme.radius.full,
    backgroundColor: '#F5E3CF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSecondaryButton: {
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    borderRadius: Theme.radius.button,
  },
  modalSecondaryButtonPressed: {
    backgroundColor: Theme.colors.background,
  },
  modalSecondaryText: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.medium,
    fontSize: 16,
  },
  modalPrimaryButton: {
    minHeight: 58,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radius.full,
    paddingHorizontal: 18,
  },
  modalPrimaryText: {
    color: Theme.colors.surface,
    fontFamily: Theme.fonts.medium,
    fontSize: 18,
  },
});
