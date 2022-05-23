declare module 'yux-storage' {
  export const setItem: (key: string, value: any) => void;
  export const getItem: (key: any) => Promise<any>;
}
