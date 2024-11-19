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

import type * as dL from './Common';
import * as eL from './Errors';
import * as cL from './Constants';

interface IContext {

    buffer: Buffer;

    cursor: number;

    opts: Required<dL.IDecodeOptions>;
}

const EMPTY_STRING = Buffer.allocUnsafe(0);

export class BencodeDecoder implements dL.IDecoder {

    public decode(data: string | Buffer, opts?: dL.IDecodeOptions): dL.IElementType {

        const context: IContext = {

            'buffer': data instanceof Buffer ? data : Buffer.from(data),
            'cursor': 0,
            'opts': {
                'stringAsBuffer': false,
                'maxStringLength': 65536,
                ...opts
            }
        };

        return this._decode(context);
    }

    private _parseByteString(data: Buffer, maxLength: number): string | Buffer {

        if (data.byteLength > maxLength) {

            return data;
        }

        const decoder = new TextDecoder();

        try {

            const result = decoder.decode(data);

            return Buffer.byteLength(result) === data.length ? result : data;
        }
        catch {

            return data;
        }
    }

    private _decode(ctx: IContext): dL.IElementType {

        switch (ctx.buffer[ctx.cursor]) {
            case cL.ECharCodes.LOWER_D:

                return this._decodeDict(ctx);

            case cL.ECharCodes.LOWER_I:

                return this._decodeInteger(ctx);

            case cL.ECharCodes.LOWER_L:

                return this._decodeList(ctx);

            default:

                return this._decodeString(ctx);
        }
    }

    private _decodeInteger(ctx: IContext): number | bigint {

        const endPos = ctx.buffer.indexOf(cL.ECharCodes.LOWER_E, ctx.cursor);

        if (endPos === -1) {

            throw new eL.E_UNEXPECTED_ENDING({ 'position': ctx.cursor });
        }

        let i = ctx.cursor + 1;
        let sign = 1;
        let val = 0;

        if (ctx.buffer[ctx.cursor + 1] === cL.ECharCodes.NEG) {

            i++;
            sign = -1;
        }

        if (i === endPos) {

            throw new eL.E_INVALID_INTEGER({ 'position': ctx.cursor });
        }

        for (; i < endPos; i++) {

            const b = ctx.buffer[i];

            if (b < cL.ECharCodes.DIGIT_0 || b > cL.ECharCodes.DIGIT_9) {

                throw new eL.E_INVALID_INTEGER({ 'position': i });
            }

            val = val * 10 + b - cL.ECharCodes.DIGIT_0;
        }

        ctx.cursor = endPos + 1;

        return val * sign;
    }

    private _decodeList(ctx: IContext): any[] {

        let ret: any[] = [];

        ctx.cursor++;

        while (1) {

            if (ctx.buffer[ctx.cursor] === undefined) {

                throw new eL.E_UNEXPECTED_ENDING({ 'position': ctx.cursor });
            }

            if (ctx.buffer[ctx.cursor] === cL.ECharCodes.LOWER_E) {

                ctx.cursor++;
                break;
            }

            ret.push(this._decode(ctx));
        }

        return ret;
    }

    private _decodeDict(ctx: IContext): Record<string, any> {

        let ret: Record<string, any> = {};
        ctx.cursor++;

        while (1) {

            if (ctx.buffer[ctx.cursor] === undefined) {

                throw new eL.E_UNEXPECTED_ENDING({ 'position': ctx.cursor });
            }

            if (ctx.buffer[ctx.cursor] === cL.ECharCodes.LOWER_E) {

                ctx.cursor++;
                break;
            }

            ret[this._decodeString(ctx).toString()] = this._decode(ctx);
        }

        return ret;
    }

    private _decodeString(ctx: IContext): Buffer | string {

        let len: number = 0;

        let i = ctx.cursor;

        if (ctx.buffer[ctx.cursor] < cL.ECharCodes.DIGIT_0 || ctx.buffer[ctx.cursor] > cL.ECharCodes.DIGIT_9) {

            throw new eL.E_INVALID_STRING_LENGTH({ 'position': i });
        }

        while (1) {

            const b = ctx.buffer[i];

            if (b === undefined) {

                throw new eL.E_UNEXPECTED_ENDING({ 'position': i });
            }

            if (b === cL.ECharCodes.COLON) {

                ctx.cursor = i + 1;
                break;
            }

            if (b < cL.ECharCodes.DIGIT_0 || b > cL.ECharCodes.DIGIT_9) {

                throw new eL.E_INVALID_STRING_LENGTH({ 'position': i });
            }

            len = len * 10 + b - cL.ECharCodes.DIGIT_0;

            i++;
        }

        let ret: Buffer | string;

        if (len) {

            if (ctx.buffer.length - ctx.cursor < len) {

                throw new eL.E_UNEXPECTED_ENDING({ 'position': i });
            }

            ret = ctx.buffer.subarray(ctx.cursor, ctx.cursor + len);

            if (!ctx.opts.stringAsBuffer) {

                ret = this._parseByteString(ret, ctx.opts.maxStringLength);
            }

            ctx.cursor += len;
        }
        else {

            ret = ctx.opts.stringAsBuffer ? EMPTY_STRING : '';
        }

        return ret;
    }
}
