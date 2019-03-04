# LiteRT/Bencode

[![npm version](https://img.shields.io/npm/v/@litert/bencode.svg?colorB=brightgreen)](https://www.npmjs.com/package/@litert/bencode "Stable Version")
[![License](https://img.shields.io/npm/l/@litert/bencode.svg?maxAge=2592000?style=plastic)](https://github.com/litert/bencode/blob/master/LICENSE)
[![node](https://img.shields.io/node/v/@litert/bencode.svg?colorB=brightgreen)](https://nodejs.org/dist/latest-v8.x/)
[![GitHub issues](https://img.shields.io/github/issues/litert/bencode.js.svg)](https://github.com/litert/bencode.js/issues)
[![GitHub Releases](https://img.shields.io/github/release/litert/bencode.js.svg)](https://github.com/litert/bencode.js/releases "Stable Release")

A bencode decode/encode library based on Node.js.

## Requirement

- TypeScript v3.1.x (or newer)
- Node.js v8.0.0 (or newer)

## Installation

```sh
npm i @litert/bencode --save
```

## Usage

```ts
import * as libBencode from "@litert/bencode";

const be = libBEncode.createBEncoder();

const beData = be.encode({ // Encode data into BEncode.
    "name": "Angus",
    "age": 18,
    "friends": [
        "Edith",
        "Alex"
    ],
    "scores": {
        "math": 87
    },
    "randomBytes": Buffer.allocUnsafe(32)
});

/**
 * Don't print as a UTF-8 string, becuase it's binary.
 */
console.log(beData);

/**
 * Print Buffer in BASE64 format in JSON.
 */
function buffer4Base64(k: string, v: any): any {

    if (typeof v === "object" && "data" in v && v.type === "Buffer") {

        return Buffer.from(v.data).toString("base64");
    }

    return v;
}

/**
 * Print the decoded object as JSON.
 *
 * The second argument of decode will transform a Buffer into string, if it's
 * a UTF-8 string.
 */
console.log(JSON.stringify(
    be.decode(beData, true),
    buffer4Base64,
    2
));
```

## License

This library is published under [Apache-2.0](./LICENSE) license.
