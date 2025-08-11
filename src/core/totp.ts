import {HOTP} from './hotp';

export class TOTP {
    /**
     * 生成TOTP验证码（公共静态方法）
     * @param secret - Base32编码的密钥
     * @param period - 时间步长（秒），默认30秒
     * @param digits - 验证码位数，默认6位
     * @param timestamp - 指定时间的时间戳
     * @param algorithm - 算法，默认SHA-1
     */
    public static generate(
        secret: string,
        period: number = 30,
        digits: number = 6,
        timestamp: number = Date.now(),
        algorithm: string = 'sha1'
    ): string {
        // 计算时间步数（复用HOTP核心逻辑）
        const timeStep = Math.floor(timestamp / 1000 / period);
        return HOTP.generate(secret, timeStep, digits, algorithm);
    }

    /**
     * 验证TOTP验证码
     * @param token - 待验证的令牌
     * @param secret - Base32编码的密钥
     * @param period - 时间步长（秒），默认30秒
     * @param digits - 验证码位数，默认6位
     * @param window - 验证窗口数量，默认1
     * @param timestamp - 指定时间的时间戳
     * @param algorithm - 算法，默认SHA-1
     */
    public static verify(
        token: string,
        secret: string,
        period: number = 30,
        digits: number = 6,
        window: number = 1,
        timestamp: number = Date.now(),
        algorithm: string = 'sha1'
    ): { success: boolean; delta: number | null } {
        const currentTimestep = Math.floor(timestamp / 1000 / period);

        // 检查前后窗口内的所有可能值
        for (let i = -window; i <= window; i++) {
            const timestep = currentTimestep + i;
            const generatedToken = HOTP.generate(secret, timestep, digits, algorithm);

            if (generatedToken === token) {
                return {success: true, delta: i};
            }
        }

        return {success: false, delta: null};
    }
}