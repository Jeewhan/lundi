export const shuffle = <T>(list: T[]) => {
  const target = list.slice();

  for (let index = target.length - 1; index > 0; index--) {
    const random = Math.floor(Math.random() * (index + 1));
    [target[index], target[random]] = [target[random], target[index]];
  }

  return target;
};
