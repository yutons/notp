import {Base32} from "../src/core/base32";

describe('Base32 测试', () => {
    test('Base32 测试', () => {
        let content = Base32.generate(20);
        console.log('base32 secret密钥：' + content);
        content = '6NDT7NFYOI2FII3HR2Q5MOVPOSTPDQCK';
        console.log('base32 secret原文：' + content);
        const encode = Base32.encode(Buffer.from(content));
        console.log('base32 encode加密：' + encode)
        const decode = Base32.decode(encode);
        console.log('base32 decode解密：' + new TextDecoder().decode(decode))
    })
});