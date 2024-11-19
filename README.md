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

Encoding:

```ts
import * as libBencode from "@litert/bencode";

const enc = new libBEncode.BencodeEncoder();

const beData = enc.encode({ // Encode data into BEncode.
    "name": "Angus",
    "age": 18,
    "friends": [
        "Edith",
        "Alex"
    ],
    "scores": {
        "math": 87
    },
    "randomBytes": Buffer.from('vsm/GvyGjZqUeuPa7ZP8h9ot8VRCe/6arpboI46EIlg=', 'base64')
});

/**
 * Don't print as a UTF-8 string, because it's binary.
 */
console.log(beData);
```

Decoding:

```ts
import * as libBencode from "@litert/bencode";

const dec = new LibBencode.BencodeDecoder();

const beData = dec.decode('d4:name5:Angus7:friendsld4:name5:Editheee');

console.log(beData); // Output: { name: 'Angus', friends: [ { name: 'Edith' } ] }
```

## License

This library is published under [Apache-2.0](./LICENSE) license.
