import { useCallback, useLayoutEffect, useRef, useState } from 'react';

const useStorage = <T,>(key: string, initialState?: T) => {
  const get = useCallback(() => {
    const value = localStorage.getItem(key);
    if (!value) return initialState;
    try {
      return JSON.parse(value) as T;
    } catch (e) {
      return initialState;
    }
  }, [key]);

  const state = useState<T>(get);
  useLayoutEffect(() => {
    const value = JSON.stringify(state[0]);
    localStorage.setItem(key, value);
  }, [state[0], key]);
  return state;
};

interface PosProps {
  x: number;
  y: number;
  width: number;
  height: number;
}
export const useDragPosition = (
  projectName: string,
): React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> => {
  const [style, setStyle] = useStorage<React.CSSProperties>(`msw-logo-pos-${projectName}`);
  const pos = useRef<PosProps>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const onDragStart: React.DragEventHandler<HTMLDivElement> = useCallback((e) => {
    // 记录鼠标相对dom的偏移量
    const targetRect = (e.target as HTMLDivElement).getBoundingClientRect();
    const y = e.clientY - targetRect.top;
    const x = e.clientX - targetRect.left;
    pos.current = {
      x,
      y,
      width: targetRect.width,
      height: targetRect.height,
    };
  }, []);
  const onDragEnd: React.DragEventHandler<HTMLDivElement> = useCallback((e) => {
    e.preventDefault();
    // 获取窗口中心点坐标
    const { clientHeight, clientWidth } = document.documentElement;
    const centerPos = {
      x: clientWidth / 2,
      y: clientHeight / 2,
    };
    // 通过当前鼠标坐标反推target坐标
    const targetPos = {
      x: e.clientX - pos.current.x,
      y: e.clientY - pos.current.y,
    };
    const left = Math.max(targetPos.x, 0);
    const top = Math.max(targetPos.y, 0);
    const right = Math.max(clientWidth - (targetPos.x + pos.current.width), 0);
    const bottom = Math.max(clientHeight - (targetPos.y + pos.current.height), 0);
    // 判断当前target的中心点在哪个象限
    if (targetPos.x < centerPos.x && targetPos.y < centerPos.y) {
      setStyle({
        left,
        top,
      });
    } else if (targetPos.x >= centerPos.x && targetPos.y < centerPos.y) {
      setStyle({
        right,
        top,
      });
    } else if (targetPos.x < centerPos.x && targetPos.y >= centerPos.y) {
      setStyle({
        left,
        bottom,
      });
    } else {
      setStyle({
        right,
        bottom,
      });
    }
  }, []);

  useLayoutEffect(() => {
    const preventHandler = (e: DragEvent) => {
      e.preventDefault()
      e.dataTransfer.effectAllowed = "copyMove";
      e.dataTransfer.dropEffect = "copy";

      document.documentElement.style.cursor = 'pointer'
      document.documentElement.style.userSelect = 'none'
    }
    document.addEventListener('dragover', preventHandler);
    return () => document.removeEventListener('dragover', preventHandler)
  }, [])

  return {
    onDragStart,
    onDragEnd,
    draggable: true,
    style,
  };
};
