/**
 * 本地存储工具 — 封装 AsyncStorage 的读写操作
 *
 * 为什么用 AsyncStorage？
 * - 它是 React Native 的标准键值存储方案
 * - 数据持久化在设备本地，关闭 App 后不会丢失
 * - 对于饮水记录这种简单数据，完全够用，无需数据库
 *
 * 数据结构设计：
 * - 饮水记录按日期存储，key 格式为 "water_logs_2026-04-27"
 * - 设置数据存储在固定 key "water_settings" 下
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/** 单条饮水记录 */
export interface WaterLog {
  id: string;
  amount: number;       // 饮水量 (ml)
  timestamp: number;    // 时间戳 (ms)
}

/** 用户设置 */
export interface WaterSettings {
  dailyGoal: number;          // 每日目标 (ml)，默认 2000
  cupSize: number;            // 单次饮水量 (ml)，默认 250
  reminderInterval: number;   // 提醒间隔 (分钟)，默认 60
  reminderEnabled: boolean;   // 是否开启提醒
}

/** 默认设置值 */
export const DEFAULT_SETTINGS: WaterSettings = {
  dailyGoal: 2000,
  cupSize: 250,
  reminderInterval: 60,
  reminderEnabled: true,
};

/**
 * 获取今天的日期字符串，作为存储 key 的一部分
 * 例如：'2026-04-27'
 */
export function getTodayKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** 保存指定日期的饮水记录 */
export async function saveLogsForDate(dateKey: string, logs: WaterLog[]): Promise<void> {
  const key = `water_logs_${dateKey}`;
  await AsyncStorage.setItem(key, JSON.stringify(logs));
}

/** 加载指定日期的饮水记录 */
export async function loadLogsForDate(dateKey: string): Promise<WaterLog[]> {
  const key = `water_logs_${dateKey}`;
  const data = await AsyncStorage.getItem(key);
  if (data) {
    return JSON.parse(data) as WaterLog[];
  }
  return [];
}

/** 保存今日饮水记录 */
export async function saveTodayLogs(logs: WaterLog[]): Promise<void> {
  await saveLogsForDate(getTodayKey(), logs);
}

/** 加载今日饮水记录 */
export async function loadTodayLogs(): Promise<WaterLog[]> {
  return loadLogsForDate(getTodayKey());
}

/** 保存用户设置 */
export async function saveSettings(settings: WaterSettings): Promise<void> {
  await AsyncStorage.setItem('water_settings', JSON.stringify(settings));
}

/** 加载用户设置，如果不存在则返回默认值 */
export async function loadSettings(): Promise<WaterSettings> {
  const data = await AsyncStorage.getItem('water_settings');
  if (data) {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  }
  return DEFAULT_SETTINGS;
}
