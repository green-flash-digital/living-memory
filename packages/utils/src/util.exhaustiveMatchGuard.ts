export function exhaustiveMatchGuard(x: never): never {
  throw new Error(
    `Exhaustive match guard failed: received unexpected value: ${JSON.stringify(x)}`
  );
}
