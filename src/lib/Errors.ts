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

/**
 * The error class for bencode.
 */
export abstract class BencodeError extends Error {

    public constructor(
        /**
         * The name of the error.
         */
        name: string,
        /**
         * The message of the error.
         */
        message: string,

        /**
         * The context of the error.
         */
        public readonly context: Record<string, unknown>,

        /**
         * The origin of the error.
         */
        public readonly origin: unknown
    ) {

        super(message);
        this.name = name;
    }
}

/* eslint-disable @typescript-eslint/naming-convention */

export class E_INVALID_INTEGER extends BencodeError {

    public constructor(context: Record<string, unknown> = {}, origin: unknown = null) {

        super(
            'invalid_integer',
            'The integer to be encoded/decoded is invalid.',
            context,
            origin,
        );
    }
}

export class E_UNSUPPORTED_DATA_TYPE extends BencodeError {

    public constructor(context: Record<string, unknown> = {}, origin: unknown = null) {

        super(
            'unsupported_data_type',
            'The type of data can not be encoded/decoded.',
            context,
            origin,
        );
    }
}

export class E_UNEXPECTED_ENDING extends BencodeError {

    public constructor(context: Record<string, unknown> = {}, origin: unknown = null) {

        super(
            'unexpected_ending',
            'The data to be decoded is not ended correctly.',
            context,
            origin,
        );
    }
}

export class E_INVALID_STRING_LENGTH extends BencodeError {

    public constructor(context: Record<string, unknown> = {}, origin: unknown = null) {

        super(
            'invalid_string_length',
            'An invalid character found in the length of a string.',
            context,
            origin,
        );
    }
}
