# BookKeepr

by [Rogerio Taques](https://x.com/rogeriotaques).

BookKeepr - _/ˈbo͝o(k)ˌkēpər/_ - is a macOS bookkeeping app for small businesses and self-employed professionals in Japan. Designed to be simple and easy.

Supports both `single-entry` and `double-entry` methods.

## What is bookkeeping?

It is the recording of financial transactions, and is part of the process of accounting in business and other organizations. It involves preparing source documents for all transactions, operations, and other events of a business.

Transactions include purchases, sales, receipts and payments by an individual person or an organization/corporation. There are several standard methods of bookkeeping, including the single-entry and double-entry bookkeeping systems.

While these may be viewed as "real" bookkeeping, any process for recording financial transactions is a bookkeeping process.

Source: [Wikipedia](https://en.wikipedia.org/wiki/Bookkeeping).

## Get started

### Build it on your own

Clone this repository.

Run the following commands:

```sh
$ cd <path-of-cloned-repository>
$ yarn install
$ (cd api; yarn install;)
$ (cd app; yarn install; yarn build)
$ yarn make
```

Next, go to `<path-of-cloned-repository>/out` and copy `BookKeepr` to `~/Applications`. Or, from your terminal, run:

```sh
$ cp -r <path-of-cloned-repository>/out/BookKeepr ~/Applications
```

\* Make sure to replace `<path-of-cloned-repository>` with the actual path to the cloned repository.

Run the following command if you want to create a distributable `.tgz` file:

```sh
$ yarn pack
```

Done. BookKeepr can be started as you usually do for any other app. 🤘

#### Troubleshooting

If you run into problems related to `sqlite3` and `node-gyp` while running `npm install` or `npm run pack`, try to downgrade `sqlite` to `^5.0.0` and install `node-gyp` globally with:

```sh
$ npm install -g node-gyp
```

Also, `PYTHON` should be exported pointing to the supported python version.

Additionally, you may try to configure `NPM` to use the supported version of python you might be using:

```sh
$ npm config set python <path/to/python>
```

### Tech stack

- Node 18.20+
- Vue 3.4+
- SQLite
- Electron

## Questions?

Have a question or need some help? <br>
Drop me a line on [Twitter](https://twitter.com/rogeriotaques).

## Bug reports and contributions

Please report bugs [here](https://github.com/rogeriotaques/bookkeepr/issues). 🙇‍♂️

Contributions are very welcome as pull requests. 🙏
