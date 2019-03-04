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

import * as Core from "@litert/core";

export const ErrorHub = Core.createErrorHub("@litert/bencode");

export const E_INVALID_INTEGER = ErrorHub.define(
    null,
    "E_INVALID_INTEGER",
    "The integer to be encoded/decoded is invalid."
);

export const E_UNSUPPORTED_DATA_TYPE = ErrorHub.define(
    null,
    "E_UNSUPPORTED_DATA_TYPE",
    "The type of data can not be encoded/decoded."
);

export const E_UNEXPECTED_ENDING = ErrorHub.define(
    null,
    "E_UNEXPECTED_ENDING",
    "The data to be decoded is not ended correctly."
);

export const E_EXPECTED_KEY_IN_DICT = ErrorHub.define(
    null,
    "E_EXPECTED_KEY_IN_DICT",
    "Missing a key in a dictionary."
);

export const E_INVALID_STRING_LENGTH = ErrorHub.define(
    null,
    "E_INVALID_STRING_LENGTH",
    "An invalid charactor found in the length of a string."
);
