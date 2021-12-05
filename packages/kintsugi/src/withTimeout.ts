import { result } from './result';
import { AsyncFn } from './types';
import { Code } from './Code';

const MAX_TIME_MS = 600;
const exception = result.fail({
  code: Code.Timeout,
});

interface Options {
  maxTimeMs?: number;
}

export function withTimeout(
  fn: AsyncFn,
  options: Options = {},
) {
  const maxTimeMs = options.maxTimeMs || MAX_TIME_MS;

  return async function (...args: any[]) {
    const promise = fn(args);
    const timeout = new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        resolve(exception);
      }, maxTimeMs);

      //This will handle the promise (and makes possible unhandled-rejection warnings away) to avoid breaking on errors, but you should still handle this promise!
      promise
        .catch(() => {})
        .then(() => clearTimeout(timeoutId));
    });

    return Promise.race([timeout, promise]);
  };
}
