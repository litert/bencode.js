import * as Test from '@litert/test';
import * as NodeFS from 'node:fs';
import { BencodeDecoder } from './Decoder';
import { BencodeEncoder } from './Encoder';

@Test.Module({
    'name': '@litert/bencode - Encoder'
})
export default class TestBencodeEncoder {

    @Test.Case({
        'name': 'Encode simple data.'
    })
    public testEncodingSimpleData(): void {

        const encoder = new BencodeEncoder();

        Test.Asserts.strictEqual(encoder.encode('123').toString(), '3:123',
            'The encoded string is incorrect.',
        );

        Test.Asserts.strictEqual(encoder.encode(123).toString(), 'i123e',
            'The encoded number is incorrect.',
        );

        Test.Asserts.strictEqual(encoder.encode(123n).toString(), 'i123e',
            'The encoded bigint is incorrect.',
        );

        Test.Asserts.strictEqual(
            encoder.encode(Buffer.from('Klzbd5gv0I24+gpN2ff7Il50G3y/evBfOc1hBOufPBg=', 'base64')).toString('base64'),
            'MzI6Klzbd5gv0I24+gpN2ff7Il50G3y/evBfOc1hBOufPBg=',
            'The encoded buffer is incorrect.',
        );

        Test.Asserts.strictEqual(encoder.encode([1, 2, 3]).toString(), 'li1ei2ei3ee',
            'The encoded list is incorrect.',
        );

        Test.Asserts.strictEqual(encoder.encode({ 'abc': 1, 'b': 2 }).toString(), 'd3:abci1e1:bi2ee',
            'The encoded dictionary is incorrect.',
        );

        Test.Asserts.strictEqual(encoder.encode({ 'abc': 1, 'b': Buffer.from('123') }).toString(), 'd3:abci1e1:b3:123e',
            'The encoded dictionary with buffer is incorrect.',
        );

        Test.Asserts.strictEqual(encoder.encode([{ 'abc': 1, 'b': Buffer.from('123') }]).toString(), 'ld3:abci1e1:b3:123ee',
            'The encoded list with nested dictionary.',
        );

        Test.Asserts.strictEqual(encoder.encode({ 'abc': 1, 'b': [Buffer.from('123')] }).toString(), 'd3:abci1e1:bl3:123ee',
            'The encoded dictionary with nested list.',
        );
    }

    @Test.Case({
        name: 'Encode a torrent file.'
    })
    public testEncodingTorrentFile(): void {

        const torrent = NodeFS.readFileSync(`${__dirname}/../test-data/CentOS-7-x86_64-DVD-1611.torrent`);

        const decoder = new BencodeDecoder();

        const data = decoder.decode(torrent) as any;

        const encoder = new BencodeEncoder();

        const encoded = encoder.encode(data);

        Test.Asserts.strictEqual(encoded.equals(torrent), true, 'The encoded data is mismatched.');
    }
}
