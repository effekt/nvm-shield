# nvm-shield

NVM-Shield acts as a barrier between you and Node, preventing you from running
your applications or pushing improperly installed packages to your project on
the wrong version.

There are two places you can use the application at the moment:

- as a prestart test in your package.json
- as a command in your CI process

## Examples

### Verify against your .nvmrc

Use the "nvm-shield" package as a pre-start script with no arguments. This will
test your .nvmrc against the current Node version.

Example **package.json**

```
"scripts": {
    "prestart": "nvm-shield",
    "start": "react-scripts start",
    ...
}
```

### Verify against a specific version

Supply a specific version to test your current Node version against.

Example **package.json**

```
"scripts": {
    "prestart": "nvm-shield --version=12.13.1",
    "start": "react-scripts start",
    ...
}
```

### Verify against a specific **major** version

Specify a major release to compare your version of Node against. In the example,
we're looking for a major version of 12, which will match 12.13.1, 12.x.x

Example **package.json**

```
"scripts": {
    "prestart": "nvm-shield --version=12 --compare=major",
    "start": "react-scripts start",
    ...
}
```

### Verify against a specific **minor** version

Specify a minor release to compare your version of Node against. In the example,
we're looking for a major version of 12.13, which will match 12.13.1, 12.13.x

Example **package.json**

```
"scripts": {
    "prestart": "nvm-shield --version=12.13 --compare=minor",
    "start": "react-scripts start",
    ...
}
```

### Use it in your CI process!

Using the `--ci` flag you can check for changes in the package-lock during your
CI process. If changes are detected the process is terminated and the build
fails.

An integration with CircleCI might look like the following:

Example **package.json**

```
"scripts": {
  "nvm-shield-ci": "nvm-shield --ci",
  ...
}
```

Example **config.yml**

```
jobs:
  build_and_test:
    docker:
      - image: circleci/node:12.13.1-browsers
    steps:
      - checkout
      - run: npm i
      - run: npm run nvm-shield-ci
      - run: npm run lint
      - run: npm test
      - run: npm run build:integration
```

### Use it as a Husky pre-push hook!

Using [Husky](https://github.com/typicode/husky) you can prevent incorrect
versions of packages being installed before they even hit the CI/CD process and
before they reach your projects repository.

Using the same `--ci` flag as mentioned in the CircleCI sample integration you
can use NVM-Shield as a pre-push hook.

An integration with Husky might look like the following:

Example **package.json**

```
"scripts": {
  "nvm-shield": "nvm-shield",
  "nvm-shield-ci": "nvm-shield --ci",
  ...
},
"husky": {
  "hooks": {
    "pre-push": "npm run nvm-shield && npm i && npm run nvm-shield-ci"
  }
},
```

This could also be extended to be used as a pre-commit hook as well to ensure
proper versions are being used when committing:

Example **package.json**

```
"scripts": {
  "nvm-shield": "nvm-shield",
  ...
},
"husky": {
  "hooks": {
    "pre-commit": "npm run nvm-shield"
  }
},
```

## Parameters

NVM-Shield allows the following parameters to be passed into it followed by an `=` (except the CI commands):

- `No Parameters`: tests .nvmrc against current Node version
- `--version`: specify a specific version to test against (can be used with `--compare`)
- `--compare`: accepts `major`, `minor`, or `patch` to compare against
- `--ci`: used after `npm i` in your CI process
