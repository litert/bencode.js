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
}

export class BencodeEncoder implements dL.IEncoder {

    public encode(data: dL.IElementType): Buffer {

        const ctx: IContext = {

            buffer: Buffer.allocUnsafe(4096),
            cursor: 0
        };

        this._encode(ctx, data);

        return ctx.buffer.subarray(0, ctx.cursor);
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

    private _encode(ctx: IContext, data: dL.IElementType): void {

        switch (typeof data) {
            case 'string':

                this._encodeString(ctx, data);
                return;

            case 'number':
            case 'bigint':

                this._encodeNumber(ctx, data);
                return;

            case 'object':

                if (data instanceof Buffer) {

                    this._encodeString(ctx, data);
                    return;
                }
                else if (Array.isArray(data)) {

                    this._encodeList(ctx, data);
                    return;
                }

                this._encodeDict(ctx, data);
                return;

            default:

                throw new eL.E_UNSUPPORTED_DATA_TYPE({ data });
        }
    }

    private _encodeNumber(ctx: IContext, num: number | bigint): void {

        if (!Number.isInteger(num) && typeof num !== 'bigint') {

            throw new eL.E_INVALID_INTEGER({ 'integer': num });
        }

        const digitQty = num.toString();
        const digitQtyStrLen = digitQty.length;
        const encodedLength = digitQtyStrLen + 2; // 'i' + num + 'e'

        this._autoExtendContextBuffer(ctx, encodedLength);

        ctx.buffer[ctx.cursor] = cL.ECharCodes.LOWER_I;

        ctx.buffer.write(digitQty, ctx.cursor + 1);

        ctx.buffer[ctx.cursor + 1 + digitQtyStrLen] = cL.ECharCodes.LOWER_E;

        ctx.cursor += encodedLength;
    }

    private _encodeString(ctx: IContext, str: string | Buffer): void {

        const bytesQty = Buffer.byteLength(str);
        const bytesQtyStrLen = bytesQty.toString();
        const encodedLength = bytesQtyStrLen.length + 1 + bytesQty; // bytesQty + ':' + str

        this._autoExtendContextBuffer(ctx, encodedLength);

        ctx.buffer.write(bytesQtyStrLen, ctx.cursor);
        ctx.buffer[ctx.cursor + bytesQtyStrLen.length] = cL.ECharCodes.COLON;

        if (bytesQty) {

            if (str instanceof Buffer) {

                str.copy(ctx.buffer, ctx.cursor + bytesQtyStrLen.length + 1);
            }
            else {

                ctx.buffer.write(str, ctx.cursor + bytesQtyStrLen.length + 1);
            }
        }

        ctx.cursor += encodedLength;
    }

    private _encodeDict(ctx: IContext, dict: Record<string, any>): void {

        this._autoExtendContextBuffer(ctx, 2);

        ctx.buffer[ctx.cursor++] = cL.ECharCodes.LOWER_D;

        for (const key in dict) {

            this._encodeString(ctx, key);
            this._encode(ctx, dict[key]);
        }

        ctx.buffer[ctx.cursor++] = cL.ECharCodes.LOWER_E;
    }

    private _encodeList(ctx: IContext, list: any[]): void {

        this._autoExtendContextBuffer(ctx, 2);

        ctx.buffer[ctx.cursor++] = cL.ECharCodes.LOWER_L;

        for (const item of list) {

            this._encode(ctx, item);
        }

        ctx.buffer[ctx.cursor++] = cL.ECharCodes.LOWER_E;
    }
}
