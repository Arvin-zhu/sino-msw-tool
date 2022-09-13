import { useCallback, useEffect, useRef, useState } from 'react';
import { throttle } from 'lodash';

type posType = { posX: number; posY: number };
export const useDrag = (isClickCallback: () => void, projectName?: string) => {
  const dragRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<posType | null>(null);
  const clickTimeStamp = useRef(null);
  const initPos = useRef<(posType & { offsetInitX?: number; offsetInitY?: number }) | null>(null);
  const timeoutRef = useRef<any>();
  const isDragRef = useRef(false);

  const resize = useCallback(
    throttle(() => {
      const localPos = localStorage.getItem(projectName + '_msw-logoPos-storage');
      if (localPos) {
        const localStoreData = JSON.parse(localPos);
        setPos({
          posX:
            window.innerWidth * (Number(localStoreData.x) >= 0.9 ? 0.9 : Number(localStoreData.x)),
          posY:
            window.innerHeight * (Number(localStoreData.y) >= 0.9 ? 0.9 : Number(localStoreData.y)),
        });
      }
    }, 100),
    [projectName],
  );

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
    resize();
  }, [resize]);
  const handlePosition = useCallback((e: any) => {
    clearTimeout(timeoutRef.current);
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
    timeoutRef.current = setTimeout(() => {
      initPos.current = {
        posX: e.pageX,
        posY: e.pageY,
        offsetInitX: initPos.current.offsetInitX,
        offsetInitY: initPos.current.offsetInitY,
      };
    }, 0);
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);
  const onMouseDown = useCallback((e: any) => {
    clickTimeStamp.current = new Date().getTime();
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
  const unbindEvent = useCallback(() => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseleave', onMouseUp);
  }, []);
  const onMouseUp = useCallback(
    (e?: any) => {
      // click 点击的时候有时候时候可能会小距离位移，所以光靠mouseMove加标志可能没有用
      // 增加一点时间限制可以避免这种情况
      const upTimeStamp = new Date().getTime();
      const isClickCircle = e?.target.closest('.msw_container_circle');
      if (isClickCircle && (!isDragRef.current || upTimeStamp - clickTimeStamp.current < 200)) {
        isClickCallback?.();
      }
      document.body.style.userSelect = 'auto';
      isDragRef.current = false;
      unbindEvent();
    },
    [unbindEvent],
  );
  useEffect(() => {
    dragRef.current?.addEventListener('mousedown', onMouseDown);
    window.addEventListener('resize', resize);
    return () => {
      unbindEvent();
      window.removeEventListener('resize', resize);
    };
  }, [resize]);
  return {
    dragRef,
    pos,
  };
};
