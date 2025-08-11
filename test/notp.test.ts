import {Algorithm, HOTP} from '../src'
import {TOTP} from '../src'

describe('HOTP 测试套件', () => {
    const baseSecret = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const baseCounter = 58494555;
    const baseDigits = 6;

    test("HOTP 基础功能测试", () => {
        expect(HOTP.generate({
            secret: baseSecret,
            counter: baseCounter,
            digits: baseDigits
        })).toBe('870526');
    });

    test("HOTP 不同位数测试", () => {
        [4, 6, 8].forEach(digits => {
            expect(HOTP.generate({
                secret: baseSecret,
                counter: baseCounter,
                digits
            })).toHaveLength(digits);
        });
    });

    test("HOTP 不同计数器测试", () => {
        const codes = [123456, 58494555, 99999999].map(counter =>
            HOTP.generate({secret: baseSecret, counter, digits: baseDigits})
        );
        expect(new Set(codes).size).toBe(codes.length);
    });

    test("HOTP 不同密钥测试", () => {
        const secrets = [
            '12345678901234567890',
            'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567',
            'ZYXWVUTSRQPONMLKJIHGFEDCBA765432'
        ];
        const codes = secrets.map(secret =>
            HOTP.generate({secret, counter: baseCounter, digits: baseDigits})
        );
        expect(new Set(codes).size).toBe(secrets.length);
    });

    test("HOTP 空密钥异常测试", () => {
        expect(() => HOTP.generate({
            secret: '',
            counter: baseCounter,
            digits: baseDigits
        })).toThrow();
    });
});

describe('TOTP 测试套件', () => {
    const baseSecret = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const baseTimestamp = 1754836665761;
    const basePeriod = 30;
    const baseDigits = 6;

    test("TOTP 基础功能测试", () => {
        expect(TOTP.generate({
            secret: baseSecret,
            period: basePeriod,
            digits: baseDigits,
            timestamp: baseTimestamp
        })).toBe('870526');
    });

    test("TOTP 验证功能测试", () => {
        expect(TOTP.verify({
            secret: baseSecret,
            period: basePeriod,
            digits: baseDigits,
            timestamp: baseTimestamp,
            token: '870526'
        })).toBe(true);
    });

    test("TOTP 不同时间步长测试", () => {
        const periods = [30, 60, 90];
        const codes = periods.map(period =>
            TOTP.generate({
                secret: baseSecret,
                period,
                digits: baseDigits,
                timestamp: baseTimestamp
            })
        );
        expect(new Set(codes).size).toBe(periods.length);
    });

    test("TOTP 不同时间戳测试", () => {
        const timestamps = [
            baseTimestamp,
            baseTimestamp + 30000,
            baseTimestamp + 60000
        ];
        const codes = timestamps.map(timestamp =>
            TOTP.generate({
                secret: baseSecret,
                period: basePeriod,
                digits: baseDigits,
                timestamp
            })
        );
        expect(new Set(codes).size).toBeGreaterThan(1);
    });

    test("TOTP 时间窗口测试", () => {
        const timestamp = Date.now();
        const code1 = TOTP.generate({
            secret: baseSecret,
            period: basePeriod,
            digits: baseDigits,
            timestamp
        });
        const code2 = TOTP.generate({
            secret: baseSecret,
            period: basePeriod,
            digits: baseDigits,
            timestamp: timestamp + basePeriod * 1000
        });
        expect(code1).not.toBe(code2);
    });

    test("TOTP 空密钥异常测试", () => {
        expect(() => TOTP.generate({
            secret: '',
            period: basePeriod,
            digits: baseDigits,
            timestamp: baseTimestamp
        })).toThrow();
    });
});

test("algorithm 参数测试", () => {
    console.log(Algorithm.includes("SHA1"));
    expect(Algorithm).toContain("SHA1");
})