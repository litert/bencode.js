/**
 * Copyright 2019 Angus.Fenying <fenying@litert.org>
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

export type ElementType = number | Buffer | string | any[] | Record<string, any>;

export interface IEncoder {

    /**
     * Encode the data into BEncode encoding.
     *
     * @param data The data to be encoded.
     */
    encode(data: ElementType): Buffer;

    /**
     * Decode data from a BEncode string.
     *
     * @param data          The BEncode string to be decoded.
     * @param autoString    Set to true if you want UTF-8 strings instead of Buffer,
     *                      when it's a UTF-8 string.
     */
    decode(
        data: string | Buffer,
        autoString?: boolean
    ): ElementType;
}
