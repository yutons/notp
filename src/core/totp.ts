import {HOTP} from './hotp';

export interface TOTPGenerateOptions {
    secret: string;
    period?: number;
    digits?: number;
    timestamp?: number;
    algorithm?: string;
}

export interface TOTPVerifyOptions {
    token: string;
    secret: string;
    period?: number;
    digits?: number;
    window?: number;
    timestamp?: number;
    algorithm?: string;
}

export class TOTP {
    /**
     * 生成TOTP验证码（公共静态方法）
     * @param secret - Base32编码的密钥
     * @param period - 时间步长（秒），默认30秒
     * @param digits - 验证码位数，默认6位
     * @param timestamp - 指定时间的时间戳
     * @param algorithm - 算法，默认SHA-1
     */
    public static generate({
                               secret,
                               period = 30,
                               digits = 6,
                               timestamp = Date.now(),
                               algorithm = 'sha1'
                           }: TOTPGenerateOptions
    ): string {
        // 计算时间步数（复用HOTP核心逻辑）
        const timeStep = Math.floor(timestamp / 1000 / period);
        return HOTP.generate({
            secret, counter: timeStep, digits, algorithm
        });
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
        {
            token,
            secret,
            period = 30,
            digits = 6,
            window = 1,
            timestamp = Date.now(),
            algorithm = 'sha1'
        }: TOTPVerifyOptions
    ): { success: boolean; delta: number | null } {
        const currentTimestep = Math.floor(timestamp / 1000 / period);

        // 检查前后窗口内的所有可能值
        for (let i = -window; i <= window; i++) {
            const timestep = currentTimestep + i;
            const generatedToken = HOTP.generate({
                secret, counter: timestep, digits, algorithm
            });

            if (generatedToken === token) {
                return {success: true, delta: i};
            }
        }

        return {success: false, delta: null};
    }
}