import pino from 'pino';

// 开发环境上 pino-pretty，生产直接吐 JSON 给采集端
// 不要在生产开 pretty，会多一层序列化，日志量大的时候很明显
const isDev = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  ...(isDev
    ? {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'HH:MM:ss' },
        },
      }
    : {}),
});

// 记录请求耗时的辅助，后面接 nginx 的 urt 对照着看
export function timer() {
  const start = process.hrtime.bigint();
  return () => Number(process.hrtime.bigint() - start) / 1e6;
}
