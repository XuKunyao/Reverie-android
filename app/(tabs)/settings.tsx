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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
          {DAILY_GOALS.map((goal) => (
            <Chip
              key={goal}
              label={`${goal} ml`}
              selected={settings.dailyGoal === goal}
              onPress={() => updateSettings({ dailyGoal: goal })}
            />
          ))}
        </View>
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
            <Text style={styles.customTitle}>自定义杯量</Text>
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
  customSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 6,
    paddingTop: 4,
  },
  customCopy: {
    flex: 1,
    minWidth: 150,
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
    width: 118,
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
    color: Theme.colors.text,
    fontFamily: Theme.fonts.medium,
    fontSize: 16,
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
});
