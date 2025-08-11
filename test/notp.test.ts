import {Algorithm, Common, HOTP, TOTP} from '../src'

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

    test("HOTP 生成Base32 Secret测试", () => {
        console.log(Common.generateSecret())
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
            'ABCDEFGHIJKLMNOPQRSTUVWXYZ212141',
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
        }).success).toBe(true);
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


test("生成TOTP验证码（Node.js）", () => {
    // 生成Base32密钥（实际使用应动态生成）
    const secret = 'JBSWY3DPEHPK3PXP';
// 生成当前时间的一次性密码
    const token = TOTP.generate({
        secret,
        algorithm: 'sha256' // 推荐使用SHA-256
    });
    console.log(`您的验证码：${token}`); // 输出示例: 123456
})

test("验证TOTP令牌（浏览器）", () => {
    const token = '123456';
   const result =  TOTP.verify({
        token: token,
        secret: 'JBSWY3DPEHPK3PXP',
        window: 3, // 允许3个时间窗口的容差
        algorithm: 'sha256'
    });
    console.log(`您的验证码：${JSON.stringify(result)}`); // 输出示例: 123456
})

test("HOTP计数器应用场景", () => {
    const counter = 1;
    const token = '123456';
    const secret = 'JBSWY3DPEHPK3PXP';
    const result = HOTP.generate({
        secret: secret,
        counter: counter
    });
    console.log(`${JSON.stringify(result)}`);
})

test("生成安全的Base32密钥", () => {
    const secret: string = Common.generateSecret(32);
    console.log(`您的Base32密钥：${secret}`); // 输出示例: 123456
})