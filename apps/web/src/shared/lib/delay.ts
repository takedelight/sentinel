export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function randomDelay(minMs: number, maxMs: number): Promise<void> {
  return delay(minMs + Math.random() * Math.max(0, maxMs - minMs));
}
