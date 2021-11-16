import rlp from "readline";

const rl = rlp.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export const ask = (str: string) => {
  return new Promise<string>((resolve) => {
    rl.question(str, resolve);
  });
};
