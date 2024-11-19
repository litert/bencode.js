/**
 * Copyright 2024 Angus.Fenying <fenying@litert.org>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// tslint:disable: no-console
import * as LibBencode from '../lib';
import * as NodeFS from 'node:fs';

const dec = new LibBencode.BencodeDecoder();
const enc = new LibBencode.BencodeEncoder();

function buffer4Base64(k: string, v: any): any {

    if (typeof v === 'object' && 'data' in v && v.type === 'Buffer') {

        return Buffer.from(v.data).toString('base64');
    }

    return v;
}

const sample = NodeFS.readFileSync(`${__dirname}/../test-data/CentOS-7-x86_64-DVD-1611.torrent`);
let torrentFile = dec.decode(sample);

console.log(JSON.stringify(torrentFile, buffer4Base64, 2));

console.log(enc.encode(torrentFile).equals(sample));
