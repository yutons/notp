import {TOTP} from "../src/core/totp";
import {Algorithm} from "../src/core/default";

describe('totp 测试', () => {
    test('totp 测试', () => {
        // 创建 TOTP 实例
        const totp = new TOTP('JBSWY3DPEHPK3PXP', 30, 6, 'sha1'); // Base32 密钥示例

        console.log('Initial Config:', totp.getConfiguration());

        // 生成当前 OTP
        const otp1 = totp.generate();
        console.log('Current OTP:', otp1);

        // 验证 OTP (允许 ±1 个周期的偏差)
        console.log('Verify OTP:', totp.verify(otp1)); // true

        // 动态修改 period
        totp.period = 60;
        const otp60 = totp.generate();
        console.log('60s Period OTP:', otp60);

        // 动态修改 digits
        totp.digits = 8;
        const otp8 = totp.generate();
        console.log('8-digit OTP:', otp8);

        // 动态修改 algorithm
        totp.algorithm = Algorithm.SM3;
        const otpSm3 = totp.generate();
        console.log('SM3 OTP:', otpSm3);

        // 使用 timestamp 进行模拟（测试过去或未来的时间）
        const now = Date.now();
        totp.timestamp = now - 45000; // 模拟 45 秒前
        const pastOtp = totp.generate();
        console.log('OTP 45s ago:', pastOtp);
        console.log('Verify past OTP:', totp.verify(pastOtp, 2)); // window=2 可能需要更大窗口

        // 恢复使用当前时间
        totp.timestamp = null;
        const currentOtp = totp.generate();
        console.log('Back to current time OTP:', currentOtp);

        // 查看剩余时间
        console.log('Time remaining in current window:', totp.timeRemaining(), 'seconds');
    })
});