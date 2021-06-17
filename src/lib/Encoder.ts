/**
 * Copyright 2021 Angus.Fenying <fenying@litert.org>
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

import * as C from './Common';
import * as E from './Errors';

interface IContext {

    buffer: Buffer;

    cursor: number;

    autoString?: boolean;
}

const BYTE_COLON = 58;
const BYTE_NEG = 45;
const BYTE_0 = 48;
const BYTE_9 = 58;
const BYTE_LOWER_D = 100;
const BYTE_LOWER_E = 101;
const BYTE_LOWER_I = 105;
const BYTE_LOWER_L = 108;

const EMPTY_STRING = Buffer.allocUnsafe(0);

class BEncoder implements C.IEncoder {

    public encode(data: C.ElementType): Buffer {

        const ctx: IContext = {

            buffer: Buffer.allocUnsafe(4096),
            cursor: 0
        };

        this._encode(ctx, data);

        return ctx.buffer.slice(0, ctx.cursor);
    }

    private _autoExtendContextBuffer(
        ctx: IContext,
        expectLength: number
    ): void {

        if (ctx.buffer.length - ctx.cursor >= expectLength) {

            return;
        }

        let v = 2;

        while (ctx.buffer.length * v - ctx.cursor < expectLength) {

            v <<= 1;
        }

        const newBuffer = Buffer.allocUnsafe(ctx.buffer.length * v);

        ctx.buffer.copy(newBuffer);

        ctx.buffer = newBuffer;
    }

    private _encode(ctx: IContext, data: C.ElementType): void {

        switch (typeof data) {
            case 'string':

                return this._encodeString(ctx, data);

            case 'number':

                return this._encodeNumber(ctx, data);

            case 'object':

                if (data instanceof Buffer) {

                    return this._encodeString(ctx, data);
                }
                else if (Array.isArray(data)) {

                    return this._encodeList(ctx, data);
                }

                return this._encodeDict(ctx, data);

            default:

                throw new E.E_UNSUPPORTED_DATA_TYPE({ data });
        }
    }

    private _encodeNumber(ctx: IContext, num: number): void {

        if (!Number.isInteger(num)) {

            throw new E.E_INVALID_INTEGER({ 'integer': num });
        }

        const ns = num.toString();
        const nsl = ns.length;
        const expLen = nsl + 2;

        this._autoExtendContextBuffer(ctx, expLen);

        ctx.buffer[ctx.cursor] = BYTE_LOWER_I;

        ctx.buffer.write(ns, ctx.cursor + 1);

        ctx.buffer[ctx.cursor + 1 + nsl] = BYTE_LOWER_E;

        ctx.cursor += expLen;
    }

    private _encodeString(ctx: IContext, s: string | Buffer): void {

        const bl = Buffer.byteLength(s);
        const bls = bl.toString();
        const expLen = bls.length + 1 + bl;

        this._autoExtendContextBuffer(ctx, expLen);

        ctx.buffer.write(bls, ctx.cursor);
        ctx.buffer[ctx.cursor + bls.length] = BYTE_COLON;

        if (bl) {

            if (s instanceof Buffer) {

                s.copy(ctx.buffer, ctx.cursor + bls.length + 1);
            }
            else {

                ctx.buffer.write(s, ctx.cursor + bls.length + 1);
            }
        }

        ctx.cursor += expLen;
    }

    private _encodeDict(ctx: IContext, dict: Record<string, any>): void {

        this._autoExtendContextBuffer(ctx, 2);

        ctx.buffer[ctx.cursor++] = BYTE_LOWER_D;

        for (const key in dict) {

            this._encodeString(ctx, key);
            this._encode(ctx, dict[key]);
        }

        ctx.buffer[ctx.cursor++] = BYTE_LOWER_E;
    }

    private _encodeList(ctx: IContext, list: any[]): void {

        this._autoExtendContextBuffer(ctx, 2);

        ctx.buffer[ctx.cursor++] = BYTE_LOWER_L;

        for (const item of list) {

            this._encode(ctx, item);
        }

        ctx.buffer[ctx.cursor++] = BYTE_LOWER_E;
    }

    public decode(
        data: string | Buffer,
        autoString: boolean = false
    ): C.ElementType {

        const context: IContext = {

            'buffer': data instanceof Buffer ? data : Buffer.from(data),
            'cursor': 0,
            autoString
        };

        return this._decode(context);
    }

    private _decode(ctx: IContext): C.ElementType {

        switch (ctx.buffer[ctx.cursor]) {
            case BYTE_LOWER_D:

                return this._decodeDict(ctx);

            case BYTE_LOWER_I:

                return this._decodeInteger(ctx);

            case BYTE_LOWER_L:

                return this._decodeList(ctx);

            default:

                return this._decodeString(ctx);
        }
    }

    private _decodeInteger(ctx: IContext): number {

        const endPos = ctx.buffer.indexOf(BYTE_LOWER_E, ctx.cursor);

        if (endPos === -1) {

            throw new E.E_UNEXPECTED_ENDING({ 'position': ctx.cursor });
        }

        let i = ctx.cursor + 1;
        let sign = 1;
        let val = 0;

        if (ctx.buffer[ctx.cursor + 1] === BYTE_NEG) {

            i++;
            sign = -1;
        }

        if (i === endPos) {

            throw new E.E_INVALID_INTEGER({ 'position': ctx.cursor });
        }

        for (; i < endPos; i++) {

            const b = ctx.buffer[i];

            if (b < BYTE_0 || b > BYTE_9) {

                throw new E.E_INVALID_INTEGER({ 'position': i });
            }

            val = val * 10 + b - BYTE_0;
        }

        ctx.cursor = endPos + 1;

        return val * sign;
    }

    private _decodeList(ctx: IContext): any[] {

        let ret: any[] = [];

        ctx.cursor++;

        while (1) {

            if (ctx.buffer[ctx.cursor] === undefined) {

                throw new E.E_UNEXPECTED_ENDING({ 'position': ctx.cursor });
            }

            if (ctx.buffer[ctx.cursor] === BYTE_LOWER_E) {

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

                throw new E.E_UNEXPECTED_ENDING({ 'position': ctx.cursor });
            }

            if (ctx.buffer[ctx.cursor] === BYTE_LOWER_E) {

                ctx.cursor++;
                break;
            }

            ret[this._decodeString(ctx).toString()] = this._decode(ctx);
        }

        return ret;
    }

    private _decodeString(ctx: IContext): string | Buffer {

        let len: number = 0;

        let i = ctx.cursor;

        if (ctx.buffer[ctx.cursor] < BYTE_0 || ctx.buffer[ctx.cursor] > BYTE_9) {

            throw new E.E_INVALID_STRING_LENGTH({ 'position': i });
        }

        while (1) {

            const b = ctx.buffer[i];

            if (b === undefined) {

                throw new E.E_UNEXPECTED_ENDING({ 'position': i });
            }

            if (b === BYTE_COLON) {

                ctx.cursor = i + 1;
                break;
            }

            if (b < BYTE_0 || b > BYTE_9) {

                throw new E.E_INVALID_STRING_LENGTH({ 'position': i });
            }

            len = len * 10 + b - BYTE_0;

            i++;
        }

        let ret: string | Buffer = EMPTY_STRING;

        if (len) {

            if (ctx.buffer.length - ctx.cursor < len) {

                throw new E.E_UNEXPECTED_ENDING({ 'position': i });
            }

            ret = ctx.buffer.slice(ctx.cursor, ctx.cursor + len);

            if (ctx.autoString) {

                const t = ret.toString('utf8');

                if (Buffer.from(t).length === ret.length) {

                    ret = t;
                }
            }

            ctx.cursor += len;
        }

        return ret;
    }
}

export function createBEncoder(): C.IEncoder {

    return new BEncoder();
}
