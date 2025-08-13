import {HOTP} from './hotp';
import {Algorithm} from "./default"; // 引入我们之前实现的 HOTP 类

/**
 * TOTP (Time-based One-Time Password) 算法实现
 * 基于 HOTP，使用时间戳作为计数器
 * 遵循 RFC 6238 标准
 */
export class TOTP {
    private _hotp: HOTP;
    private _period: number;
    private _timestamp: number | null; // null 表示使用当前系统时间
    private _algorithm: Algorithm;

    /**
     * 构造函数
     * @param secret - 共享密钥 (通常为 Base32 编码)
     * @param period - 时间步长（周期），单位为秒，默认为 30 秒
     * @param digits - 生成的一次性密码的位数，默认为 6
     * @param algorithm - HMAC 哈希算法，默认为 'sha1'
     */
    constructor(
        secret: string,
        period: number = 30,
        digits: number = 6,
        algorithm: Algorithm
    ) {
        this._hotp = new HOTP(secret, 0, digits, algorithm);
        this._period = period;
        this._timestamp = null; // 默认使用当前时间
        this._algorithm = algorithm;
    }

    // --- Getter 和 Setter 方法 ---

    /**
     * 获取当前共享密钥
     */
    get secret(): string {
        return this._hotp.secret;
    }

    /**
     * 设置共享密钥
     * @param value - 新的共享密钥
     */
    set secret(value: string) {
        this._hotp.secret = value;
    }

    /**
     * 获取当前时间步长（周期）
     */
    get period(): number {
        return this._period;
    }

    /**
     * 设置时间步长（周期）
     * @param value - 新的周期（秒）
     */
    set period(value: number) {
        if (!Number.isInteger(value) || value <= 0) {
            throw new Error('Period must be a positive integer.');
        }
        this._period = value;
    }

    /**
     * 获取生成密码的位数
     */
    get digits(): number {
        return this._hotp.digits;
    }

    /**
     * 设置生成密码的位数
     * @param value - 新的位数 (通常为 6, 7, 8)
     */
    set digits(value: number) {
        this._hotp.digits = value;
    }

    /**
     * 获取当前使用的哈希算法
     */
    get algorithm(): Algorithm {
        return this._hotp.algorithm;
    }

    /**
     * 设置哈希算法
     * @param value - 新的算法 ('sha1', 'sha256', 'sha512', 'sm3')
     */
    set algorithm(value: Algorithm) {
        this._hotp.algorithm = value;
    }

    /**
     * 获取当前用于计算的模拟时间戳（毫秒）
     * 返回 null 表示使用系统当前时间
     */
    get timestamp(): number | null {
        return this._timestamp;
    }

    /**
     * 设置用于计算的模拟时间戳（毫秒）
     * 设置为 null 时，将使用系统当前时间
     * @param value - 模拟的时间戳（毫秒），或 null
     */
    set timestamp(value: number | null) {
        if (value !== null && (typeof value !== 'number' || !Number.isInteger(value) || value < 0)) {
            throw new Error('Timestamp must be a non-negative integer or null.');
        }
        this._timestamp = value;
    }

    // --- 核心方法 ---

    /**
     * 计算基于当前时间（或模拟时间）的计数器值
     * @returns 计数器值
     */
    private getTimeCounter(): number {
        const now = this._timestamp !== null ? this._timestamp : Date.now();
        // 将毫秒时间戳转换为秒，然后除以周期并向下取整得到计数器
        return Math.floor(now / 1000 / this._period);
    }

    /**
     * 生成当前时间窗口的一次性密码
     * @returns 生成的一次性密码 (字符串)
     */
    generate(): string {
        const counter = this.getTimeCounter();
        return this._hotp.generate(counter);
    }

    /**
     * 验证提供的 OTP 是否有效
     * 为了容忍客户端和服务器之间的时间偏差，通常会检查当前时间窗口前后几个窗口
     * @param otp - 要验证的 OTP (字符串)
     * @param window - 允许的时间窗口偏差（向前和向后），默认为 1
     *                 例如 window=1 会检查 T-1, T, T+1 三个时间窗口
     * @returns 验证结果 (true 或 false)
     */
    verify(otp: string, window: number = 1): boolean {
        if (typeof otp !== 'string' || !/^\d+$/.test(otp)) {
            return false;
        }

        const currentCounter = this.getTimeCounter();

        // 检查从 (currentCounter - window) 到 (currentCounter + window) 的所有窗口
        for (let i = -window; i <= window; i++) {
            const counterToCheck = currentCounter + i;
            if (this._hotp.verify(otp, counterToCheck)) {
                return true;
            }
        }

        return false;
    }

    // --- 便捷方法 ---

    /**
     * 获取当前时间窗口的剩余有效时间（秒）
     * @returns 剩余有效时间（秒），如果为负数表示已过期
     */
    timeRemaining(): number {
        const now = this._timestamp !== null ? this._timestamp : Date.now();
        const currentPeriodStart = Math.floor(now / 1000 / this._period) * this._period;
        return this._period - ((now / 1000) - currentPeriodStart);
    }

    /**
     * 获取当前时间窗口的开始时间（Unix 时间戳，秒）
     * @returns 当前时间窗口的开始时间
     */
    currentPeriodStart(): number {
        const now = this._timestamp !== null ? this._timestamp : Date.now();
        return Math.floor(now / 1000 / this._period) * this._period;
    }

    /**
     * 获取当前配置的摘要信息
     */
    getConfiguration(): {
        secret: string;
        period: number;
        digits: number;
        algorithm: 'sha1' | 'sha256' | 'sha512' | 'sm3';
        timestamp: number | null;
    } {
        return {
            secret: this._hotp.secret,
            period: this._period,
            digits: this._hotp.digits,
            algorithm: this._hotp.algorithm,
            timestamp: this._timestamp,
        };
    }
}