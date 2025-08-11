import { HOTP } from '../src'
import { TOTP } from '../src'

test("HOTP 静态数据测试", () => {
    const secret = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const timeStep = 58494555;
    const digits = 6;
    const code = '870526';
    expect(HOTP.generate(secret, timeStep, digits)).toBe(code);
})

test("HOTP 不同位数测试", () => {
    const secret = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const timeStep = 58494555;
    expect(HOTP.generate(secret, timeStep, 6)).toHaveLength(6);
    expect(HOTP.generate(secret, timeStep, 8)).toHaveLength(8);
})

test("HOTP 不同密钥测试", () => {
    const timeStep = 58494555;
    const digits = 6;
    expect(HOTP.generate('12345678901234567890', timeStep, digits)).not.toBe('870526');
})

test('TOTP 静态数据测试', () => {
    const ts = 1754836665761;
    const code = '870526';
    expect(TOTP.generate('ABCDEFGHIJKLMNOPQRSTUVWXYZ234567', 30, 6, ts)).toBe(code)
})

test('TOTP 不同时间步长测试', () => {
    const ts = 1754836665761;
    expect(TOTP.generate('ABCDEFGHIJKLMNOPQRSTUVWXYZ234567', 30, 6, ts))
        .not.toBe(TOTP.generate('ABCDEFGHIJKLMNOPQRSTUVWXYZ234567', 60, 6, ts))
})

test('TOTP 不同时间戳测试', () => {
    expect(TOTP.generate('ABCDEFGHIJKLMNOPQRSTUVWXYZ234567', 30, 6, 1754836665761))
        .not.toEqual(TOTP.generate('ABCDEFGHIJKLMNOPQRSTUVWXYZ234567', 30, 6, 1754839665761))
})