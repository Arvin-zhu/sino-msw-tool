import { useCallback, useEffect, useRef, useState } from 'react';

type posType = { posX: number; posY: number };
export const useDrag = (isClickCallback: () => void, projectName?: string) => {
  const dragRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<posType | null>(null);
  const initPos = useRef<(posType & { offsetInitX?: number; offsetInitY?: number }) | null>(null);
  const isDragRef = useRef(false);
  useEffect(() => {
    if (pos) {
      // 百分比存储
      const storePercentPos = {
        x: pos.posX / window.innerWidth,
        y: pos.posY / window.innerHeight,
      };
      localStorage.setItem(projectName + '_msw-logoPos-storage', JSON.stringify(storePercentPos));
    }
  }, [pos, projectName]);
  useEffect(() => {
    //初始化时候读取本地msw位置
    const localPos = localStorage.getItem(projectName + '_msw-logoPos-storage');
    if (localPos) {
      const localStoreData = JSON.parse(localPos);
      setPos({
        posX: window.innerWidth * localStoreData.x,
        posY: window.innerHeight * localStoreData.y,
      });
    }
  }, [projectName]);
  const handlePosition = useCallback((e: any) => {
    setPos((prePos) => {
      return {
        posX:
          e.pageX -
          initPos.current.posX +
          (prePos !== null ? prePos?.posX : initPos.current.offsetInitX),
        posY:
          e.pageY -
          initPos.current.posY +
          (prePos !== null ? prePos?.posY : initPos.current.offsetInitY),
      };
    });
    //react 18 useRef更新机制问题修复
    setTimeout(() => {
      initPos.current = {
        posX: e.pageX,
        posY: e.pageY,
        offsetInitX: initPos.current.offsetInitX,
        offsetInitY: initPos.current.offsetInitY,
      };
    }, 0);
  }, []);
  const onMouseDown = useCallback((e: any) => {
    initPos.current = {
      posX: e.pageX,
      posY: e.pageY,
      offsetInitX: e.pageX - e.target.offsetWidth / 2,
      offsetInitY: e.pageY - e.target.offsetHeight / 2,
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseUp);
  }, []);
  const onMouseMove = useCallback((e: any) => {
    document.body.style.userSelect = 'none';
    isDragRef.current = true;
    handlePosition(e);
  }, []);
  const onMouseUp = useCallback((e?: any) => {
    e?.target.className.includes('msw_container_circle') &&
      !isDragRef.current &&
      isClickCallback?.();
    document.body.style.userSelect = 'auto';
    isDragRef.current = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseleave', onMouseUp);
  }, []);
  useEffect(() => {
    dragRef.current?.addEventListener('mousedown', onMouseDown);
    return () => {
      onMouseUp();
    };
  }, []);
  return {
    dragRef,
    pos,
  };
};
