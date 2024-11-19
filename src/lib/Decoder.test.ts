import * as Test from '@litert/test';
import * as NodeFS from 'node:fs';
import { BencodeDecoder } from './Decoder';
import * as E from './Errors';

@Test.Module({
    'name': '@litert/bencode - Decoder'
})
export default class TestBencodeDecoder {

    @Test.Case({
        'name': 'Decode simple data.'
    })
    public testDecodeSimpleData(): void {

        const decoder = new BencodeDecoder();

        Test.Asserts.strictEqual(
            decoder.decode('11:01234567891'),
            '01234567891',
            'The decoded string is incorrect.'
        );

        Test.Asserts.strictEqual(
            decoder.decode('0:'),
            '',
            'The decoded empty string is incorrect.'
        );

        Test.Asserts.strictEqual(
            decoder.decode('3:123', { 'stringAsBuffer': true }) instanceof Buffer,
            true,
            'The decoded Buffer is incorrect.'
        );

        Test.Asserts.strictEqual(
            Buffer.from('123').equals(decoder.decode('3:123', { 'stringAsBuffer': true }) as Buffer),
            true,
            'The decoded Buffer is incorrect.'
        );

        Test.Asserts.strictEqual(
            decoder.decode('0:', { 'stringAsBuffer': true }) instanceof Buffer,
            true,
            'The decoded empty Buffer is incorrect.'
        );

        Test.Asserts.strictEqual(
            (decoder.decode('0:', { 'stringAsBuffer': true }) as Buffer).byteLength,
            0,
            'The decoded empty Buffer is incorrect.'
        );

        Test.Asserts.strictEqual(
            decoder.decode('i123e'),
            123,
            'The decoded number is incorrect.'
        );

        Test.Asserts.strictEqual(
            decoder.decode('i-123e'),
            -123,
            'The decoded negative number is incorrect.'
        );

        Test.Asserts.deepStrictEqual(
            decoder.decode('le'),
            [],
            'The decoded empty list is incorrect.'
        );

        Test.Asserts.deepStrictEqual(
            decoder.decode('de'),
            {},
            'The decoded empty dictionary is incorrect.'
        );

        Test.Asserts.deepStrictEqual(
            decoder.decode('ldee'),
            [{}],
            'The decoded nested list is incorrect.'
        );

        Test.Asserts.deepStrictEqual(
            decoder.decode('d1:ali123eee'),
            { a: [123] },
            'The decoded nested dictionary is incorrect.'
        );

        Test.Asserts.deepStrictEqual(
            decoder.decode('d3:abci123e0:0:e'),
            { abc: 123, '': '' },
            'The decoded dictionary is incorrect.'
        );

        Test.Asserts.deepStrictEqual(
            decoder.decode('l3:abci123e0:0:i-123ee'),
            [ 'abc', 123, '', '', -123 ],
            'The decoded list is incorrect.'
        );
    }

    @Test.Case({
        'name': 'Decode a torrent file.'
    })
    public testDecodeTorrentFile(): void {

        const torrent = NodeFS.readFileSync(`${__dirname}/../test-data/CentOS-7-x86_64-DVD-1611.torrent`);

        const decoder = new BencodeDecoder();

        const data = decoder.decode(torrent) as any;

        Test.Asserts.strictEqual(data?.announce, 'http://linuxtracker.org:2710/00000000000000000000000000000000/announce',
            'The announce URL is mismatched.'
        );

        Test.Asserts.deepStrictEqual(
            data?.['announce-list'],
            [
                [
                    'http://torrent.centos.org:6969/announce'
                ],
                [
                    'http://ipv6.torrent.centos.org:6969/announce'
                ],
                [
                    'http://linuxtracker.org:2710/00000000000000000000000000000000/announce'
                ]
            ],
            'The announce list is mismatched.'
        );

        Test.Asserts.strictEqual(data?.comment, 'CentOS x86_64 DVD ISO',
            'The comment is mismatched.'
        );

        Test.Asserts.strictEqual(data?.['created by'], 'mktorrent 1.0',
            'The creator is mismatched.'
        );

        Test.Asserts.strictEqual(data?.['creation date'], 1481207143,
            'The creation date is mismatched.'
        );

        Test.Asserts.strictEqual(data?.info?.name, 'CentOS-7-x86_64-DVD-1611',
            'The name of the file is mismatched.'
        );

        Test.Asserts.deepStrictEqual(
            data.info.files,
            [
                {
                    'length': 2498,
                    'path': [
                        '0_README.txt'
                    ]
                },
                {
                    'length': 4379901952,
                    'path': [
                        'CentOS-7-x86_64-DVD-1611.iso'
                    ]
                },
                {
                    'length': 454,
                    'path': [
                        'sha1sum.txt'
                    ]
                },
                {
                    'length': 1314,
                    'path': [
                        'sha1sum.txt.asc'
                    ]
                },
                {
                    'length': 598,
                    'path': [
                        'sha256sum.txt'
                    ]
                },
                {
                    'length': 1458,
                    'path': [
                        'sha256sum.txt.asc'
                    ]
                }
            ],
            'The files are mismatched.'
        );

        Test.Asserts.strictEqual(data.info['piece length'], 524288,
            'The piece length is mismatched.'
        );

        Test.Asserts.strictEqual(data.info.pieces instanceof Buffer, true,
            'The pieces is not a buffer.'
        );
    }

    @Test.Case({
        'name': 'Decode incorrect data.'
    })
    public testDecodeIncorrectData(): void {

        const decoder = new BencodeDecoder();

        try {
            decoder.decode('1');
            Test.Asserts.fail('Should not reach here.');
        }
        catch (e) {

            Test.Asserts.strictEqual(e instanceof E.E_UNEXPECTED_ENDING, true,
                'For string-length without colon, the error should be E_UNEXPECTED_ENDING.'
            );
        }

        try {
            decoder.decode('2:1');
            Test.Asserts.fail('Should not reach here.');
        }
        catch (e) {

            Test.Asserts.strictEqual(e instanceof E.E_UNEXPECTED_ENDING, true,
                'For insufficient string-length, the error should be E_UNEXPECTED_ENDING.'
            );
        }

        try {
            decoder.decode('2d:1');
            Test.Asserts.fail('Should not reach here.');
        }
        catch (e) {

            Test.Asserts.strictEqual(e instanceof E.E_INVALID_STRING_LENGTH, true,
                'For invalid string-length, the error should be E_INVALID_STRING_LENGTH.'
            );
        }

        try {
            decoder.decode('a');
            Test.Asserts.fail('Should not reach here.');
        }
        catch (e) {

            Test.Asserts.strictEqual(e instanceof E.E_INVALID_STRING_LENGTH, true,
                'For other unknown directive character, the error should be E_INVALID_STRING_LENGTH.'
            );
        }
    }
}
