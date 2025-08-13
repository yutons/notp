import {HOTP} from './hotp';
import {Algorithm, Common} from "../utils/common";

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

// 支持的算法列表

export class TOTP {
    /**
     * 生成TOTP验证码（公共静态方法）
     * @param secret - Base32编码的密钥
     * @param period - 时间步长（秒），默认30秒
     * @param digits - 验证码位数，默认6位
     * @param timestamp - 指定时间的时间戳（毫秒）
     * @param algorithm - 算法，默认SHA-1
     */
    public static generate({
                               secret,
                               period = Common.DEFAULT_PERIOD,
                               digits = Common.DEFAULT_DIGITS,
                               timestamp = Date.now(),
                               algorithm = Common.DEFAULT_ALGORITHM
                           }: TOTPGenerateOptions
    ): string {
        Common.validateAlgorithm(typeof algorithm === "string" ? algorithm : "SHA1");

        // 计算时间步数（复用HOTP核心逻辑）
        const timeStep = Common.calculateTimeStep(typeof timestamp === "number" ? timestamp : Date.now(), typeof period === "number" ? period : 30);
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
     * @param timestamp - 指定时间的时间戳（毫秒）
     * @param algorithm - 算法，默认SHA-1
     */
    public static verify(
        {
            token,
            secret,
            period = Common.DEFAULT_PERIOD,
            digits = Common.DEFAULT_DIGITS,
            window = Common.DEFAULT_WINDOW,
            timestamp = Date.now(),
            algorithm = Common.DEFAULT_ALGORITHM
        }: TOTPVerifyOptions
    ): { success: boolean; delta: number | null } {
        Common.validateAlgorithm(typeof algorithm === "string" ? algorithm : "SHA1");

        if (window < 0) {
            throw new Error('Window must be non-negative');
        }

        const currentTimestep = Common.calculateTimeStep(typeof timestamp === "number" ? timestamp : Date.now(), typeof period === "number" ? period : 30);

        // 检查前后窗口内的所有可能值
        for (let i = -window; i <= window; i++) {
            const timestep = currentTimestep + i;
            try {
                const generatedToken = HOTP.generate({
                    secret, counter: timestep, digits, algorithm
                });

                if (generatedToken === token) {
                    return {success: true, delta: i};
                }
            } catch (error) {
                // 忽略单个生成失败的情况，继续检查其他时间步
                continue;
            }
        }

        return {success: false, delta: null};
    }
}
