import notp from "../src";

describe('notp 测试', () => {
    test('notp 测试', () => {
        const totp = new notp.TOTP('JBSWY3DPEHPK3PXP');
        console.log(totp.generate());
    })
})