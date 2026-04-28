/**
 * 全局饮水状态管理 — 使用 React Context + useReducer
 *
 * 为什么用 Context 而不是 Redux？
 * - 应用只有 2 个页面，状态很简单
 * - Context + useReducer 是 React 内置方案，零额外依赖
 * - 对初学者更容易理解
 *
 * 状态流动：
 * 1. App 启动时从 AsyncStorage 加载数据
 * 2. 用户操作（喝水、改设置）通过 dispatch 更新状态
 * 3. 状态变化后自动同步回 AsyncStorage
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import {
  WaterLog,
  WaterSettings,
  DEFAULT_SETTINGS,
  saveTodayLogs,
  loadTodayLogs,
  saveSettings,
  loadSettings,
} from '@/utils/storage';
import { scheduleWaterReminder, cancelAllReminders } from '@/utils/notifications';

/** 全局状态类型 */
interface WaterState {
  settings: WaterSettings;
  todayLogs: WaterLog[];
  todayTotal: number;
  isLoaded: boolean;    // 数据是否已从存储加载完成
}

/** 所有可能的 Action 类型 */
type WaterAction =
  | { type: 'LOAD_DATA'; settings: WaterSettings; logs: WaterLog[] }
  | { type: 'ADD_WATER'; amount: number }
  | { type: 'DELETE_LOG'; id: string }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<WaterSettings> };

/** 计算今日总饮水量 */
function calcTotal(logs: WaterLog[]): number {
  return logs.reduce((sum, log) => sum + log.amount, 0);
}

/** 生成唯一 ID */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/** 初始状态 */
const initialState: WaterState = {
  settings: DEFAULT_SETTINGS,
  todayLogs: [],
  todayTotal: 0,
  isLoaded: false,
};

/**
 * Reducer — 所有状态变化的核心逻辑
 * 类似于一个"状态变更处理器"，接收当前状态和动作，返回新状态
 */
function waterReducer(state: WaterState, action: WaterAction): WaterState {
  switch (action.type) {
    case 'LOAD_DATA': {
      return {
        ...state,
        settings: action.settings,
        todayLogs: action.logs,
        todayTotal: calcTotal(action.logs),
        isLoaded: true,
      };
    }
    case 'ADD_WATER': {
      const newLog: WaterLog = {
        id: generateId(),
        amount: action.amount,
        timestamp: Date.now(),
      };
      const newLogs = [newLog, ...state.todayLogs]; // 新记录放最前面
      return {
        ...state,
        todayLogs: newLogs,
        todayTotal: calcTotal(newLogs),
      };
    }
    case 'DELETE_LOG': {
      const newLogs = state.todayLogs.filter(log => log.id !== action.id);
      return {
        ...state,
        todayLogs: newLogs,
        todayTotal: calcTotal(newLogs),
      };
    }
    case 'UPDATE_SETTINGS': {
      const newSettings = { ...state.settings, ...action.settings };
      return {
        ...state,
        settings: newSettings,
      };
    }
    default:
      return state;
  }
}

/** Context 类型 */
interface WaterContextType {
  state: WaterState;
  addWater: (amount?: number) => void;
  deleteLog: (id: string) => void;
  updateSettings: (settings: Partial<WaterSettings>) => void;
}

const WaterContext = createContext<WaterContextType | undefined>(undefined);

/**
 * WaterProvider — 包裹整个 App，提供全局状态
 *
 * 使用方式：
 * 在 _layout.tsx 中包裹 <WaterProvider>
 * 在任何子组件中用 useWater() 获取状态和操作函数
 */
export function WaterProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(waterReducer, initialState);

  // App 启动时加载数据
  useEffect(() => {
    async function loadData() {
      const [settings, logs] = await Promise.all([
        loadSettings(),
        loadTodayLogs(),
      ]);
      dispatch({ type: 'LOAD_DATA', settings, logs });
    }
    loadData();
  }, []);

  // 饮水记录变化时，自动保存到本地存储
  useEffect(() => {
    if (state.isLoaded) {
      saveTodayLogs(state.todayLogs);
    }
  }, [state.todayLogs, state.isLoaded]);

  // 设置变化时，保存设置并更新提醒
  useEffect(() => {
    if (state.isLoaded) {
      saveSettings(state.settings);
      // 更新提醒调度
      if (state.settings.reminderEnabled) {
        scheduleWaterReminder(state.settings.reminderInterval);
      } else {
        cancelAllReminders();
      }
    }
  }, [state.settings, state.isLoaded]);

  /** 喝了一杯水 */
  const addWater = (amount?: number) => {
    dispatch({ type: 'ADD_WATER', amount: amount ?? state.settings.cupSize });
  };

  /** 删除一条记录 */
  const deleteLog = (id: string) => {
    dispatch({ type: 'DELETE_LOG', id });
  };

  /** 更新设置 */
  const updateSettings = (settings: Partial<WaterSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', settings });
  };

  return (
    <WaterContext.Provider value={{ state, addWater, deleteLog, updateSettings }}>
      {children}
    </WaterContext.Provider>
  );
}

/**
 * 自定义 Hook — 在任何组件中获取饮水状态
 *
 * 使用示例：
 * const { state, addWater } = useWater();
 * console.log(state.todayTotal); // 今日总饮水量
 * addWater(); // 喝了一杯（使用默认杯量）
 */
export function useWater(): WaterContextType {
  const context = useContext(WaterContext);
  if (!context) {
    throw new Error('useWater must be used within a WaterProvider');
  }
  return context;
}
