const validArguments = ['--compare', '--version'];

export const parseArguments = () => {
  const args = process.argv.slice(2);

  if (!args.length) return;

  return args
    .map(arg => {
      const split = arg.split('=');
      if (!validArguments.find(validArg => validArg === split[0]))
        throw new Error(`Invalid argument: ${split[0]}`);
      return split;
    })
    .reduce((obj: { [key: string]: string | undefined }, arg) => {
      obj[arg[0]] = arg[1];
      return obj;
    }, {});
};
