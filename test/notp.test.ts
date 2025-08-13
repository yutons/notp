import {Algorithm, HOTP, TOTP} from '../src'

describe('HOTP 测试套件', () => {
    const secret = 'newcapec';
    const counter = 0;
    const digits = 6;

    // 生成 HOTP (使用计数器 0)
    test("生成 HOTP (使用计数器 0)", () => {

        console.log("=== HOTP (Counter=0) ===");
        for (const algorithm in Algorithm) {
            const result = HOTP.generate({
                secret, counter, digits, algorithm
            })
            console.log(`${algorithm} HOTP: ${result}`)
        }
    })
});

describe('TOTP 测试套件', () => {
    const secret = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const timestamp = Date.now();
    const period = 30;
    const digits = 6;

    test("生成 TOTP (使用当前时间)", () => {

        console.log("=== TOTP (Current Time) ===");
        for (const algorithm in Algorithm) {
            const result = TOTP.generate({
                secret, timestamp, period, digits, algorithm
            })
            console.log(`${algorithm} TOTP: ${result} ${timestamp}`)
        }
    })

    test("验证不同时间步长", () => {

        console.log("=== TOTP (Different Time Steps) ===");
        const timeSteps = [10, 20, 30, 60];
        for (const ts of timeSteps) {
            const result = TOTP.generate({
                secret, timestamp: ts, period, digits, algorithm: Algorithm.SHA1
            })
            console.log(`${Algorithm.SHA1} TOTP: ${result}`)
        }
    })

    test("验证不同位数", () => {

        console.log("=== TOTP (Different Digits) ===");
        const digits = [6, 8];
        for (const digit of digits) {
            const result = TOTP.generate({
                secret, timestamp, period, digits: digit, algorithm: Algorithm.SHA256
            })
            console.log(`${Algorithm.SHA256} TOTP: ${result}`)
        }
    })
});