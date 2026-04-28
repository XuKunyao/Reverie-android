/**
 * WaterLogItem — 饮水记录列表项
 *
 * 设计思路：
 * - 极简的单行布局：左侧饮水量，右侧时间
 * - 底部用极淡的分割线分隔
 * - 长按可删除（通过 onDelete 回调）
 * - 整体风格安静、不抢眼
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';

interface WaterLogItemProps {
  amount: number;       // 饮水量 (ml)
  timestamp: number;    // 时间戳 (ms)
  onDelete?: () => void;
}

/** 将时间戳格式化为 "14:30" 格式 */
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function WaterLogItem({ amount, timestamp, onDelete }: WaterLogItemProps) {
  return (
    <Pressable
      onLongPress={onDelete}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.left}>
        <Feather name="droplet" size={16} color={Theme.colors.primary} />
        <Text style={styles.amount}>{amount} ml</Text>
      </View>
      <Text style={styles.time}>{formatTime(timestamp)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Theme.colors.border,
  },
  pressed: {
    opacity: 0.6,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  amount: {
    fontSize: 16,
    fontFamily: Theme.fonts.medium,
    color: Theme.colors.text,
  },
  time: {
    fontSize: 14,
    fontFamily: Theme.fonts.regular,
    color: Theme.colors.textSecondary,
  },
});
