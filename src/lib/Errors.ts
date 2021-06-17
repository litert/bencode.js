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

import * as $Exceptions from '@litert/exception';

export const exceptionRegistry = $Exceptions.createExceptionRegistry({
    'module': 'bencode.litert.org',
    'types': {
        'bencode': {
            index: $Exceptions.createIncreaseCodeIndex(0)
        }
    }
});

export const E_INVALID_INTEGER = exceptionRegistry.register({
    name: 'invalid_integer',
    message: 'The integer to be encoded/decoded is invalid.',
    metadata: {},
    type: 'bencode'
});

export const E_UNSUPPORTED_DATA_TYPE = exceptionRegistry.register({
    name: 'unsupported_data_type',
    message: 'The type of data can not be encoded/decoded.',
    metadata: {},
    type: 'bencode'
});

export const E_UNEXPECTED_ENDING = exceptionRegistry.register({
    name: 'unexpected_ending',
    message: 'The data to be decoded is not ended correctly.',
    metadata: {},
    type: 'bencode'
});

export const E_EXPECTED_KEY_IN_DICT = exceptionRegistry.register({
    name: 'expected_key_in_dict',
    message: 'Missing a key in a dictionary.',
    metadata: {},
    type: 'bencode'
});

export const E_INVALID_STRING_LENGTH = exceptionRegistry.register({
    name: 'invalid_string_length',
    message: 'An invalid charactor found in the length of a string.',
    metadata: {},
    type: 'bencode'
});
