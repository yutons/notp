import * as CryptoJS from 'crypto-js';
import {sm3} from 'sm-crypto';
import {Base32} from "./base32";
import {Algorithm, Default} from "./default";

/**
 * HOTP (HMAC-based One-Time Password) 算法实现
 * 使用时间戳作为计数器
 * 遵循 RFC 4226 标准
 * 兼容浏览器环境
 */
export class HOTP {
    private _secret: string;
    private _counter: number;
    private _digits: number;
    private _algorithm: Algorithm;

    /**
     * 构造函数
     * @param secret - 共享密钥 (通常为 Base32 编码)
     * @param counter - 计数器初始值
     * @param digits - 生成的一次性密码的位数，默认为 6
     * @param algorithm - HMAC 哈希算法，默认为 'sha1'
     */
    constructor(
        secret: string,
        counter: number = 0,
        digits: number = 6,
        algorithm?: Algorithm
    ) {
        this._secret = secret;
        this._counter = counter;
        this._digits = digits;
        this._algorithm = algorithm || Algorithm.SHA1;
    }

    // --- Getter 和 Setter 方法 ---

    get secret(): string {
        return this._secret;
    }

    set secret(value: string) {
        if (!value || typeof value !== 'string') {
            throw new Error('Secret must be a non-empty string.');
        }
        this._secret = value;
    }

    get counter(): number {
        return this._counter;
    }

    set counter(value: number) {
        if (!Number.isInteger(value) || value < 0) {
            throw new Error('Counter must be a non-negative integer.');
        }
        this._counter = value;
    }

    get digits(): number {
        return this._digits;
    }

    set digits(value: number) {
        if (!Number.isInteger(value) || value < 6 || value > 10) {
            throw new Error('Digits must be an integer between 6 and 10.');
        }
        this._digits = value;
    }

    get algorithm(): Algorithm {
        return this._algorithm;
    }

    set algorithm(value: Algorithm) {
        if (!Default.isSupportedAlgorithm(value)) {
            throw new Error(`Algorithm must be one of: ${Default.SUPPORTED_ALGORITHMS}`);
        }
        this._algorithm = value;
    }

    // --- 核心方法 ---

    /**
     * 生成指定计数器值的一次性密码
     * @param counter - 指定的计数器值 (可选，如果不提供则使用实例的 counter)
     * @returns 生成的一次性密码 (字符串)
     */
    generate(counter?: number): string {
        const counterToUse = counter !== undefined ? counter : this._counter;
        const keyBytes = Base32.decode(this._secret);
        const counterBytes = this.intTo8Bytes(counterToUse);

        let digestBytes: Uint8Array<any>;

        if (this._algorithm === 'sm3') {
            // sm3(data, { key: keyHex })
            const keyHex = this.bytesToHex(keyBytes);
            const counterHex = this.bytesToHex(counterBytes);
            const hmacHex = sm3(counterHex, {key: keyHex});
            digestBytes = this.hexToBytes(hmacHex);
        } else {
            // 使用 crypto-js
            const keyWordArray = CryptoJS.enc.Hex.parse(this.bytesToHex(keyBytes));
            const messageWordArray = CryptoJS.enc.Hex.parse(this.bytesToHex(counterBytes));

            let hash;
            switch (this._algorithm) {
                case Algorithm.SHA1:
                    hash = CryptoJS.HmacSHA1(messageWordArray, keyWordArray);
                    break;
                case Algorithm.SHA256:
                    hash = CryptoJS.HmacSHA256(messageWordArray, keyWordArray);
                    break;
                case Algorithm.SHA512:
                    hash = CryptoJS.HmacSHA512(messageWordArray, keyWordArray);
                    break;
                default:
                    throw new Error(`Unsupported algorithm: ${this._algorithm}`);
            }

            const hex = hash.toString(CryptoJS.enc.Hex);
            digestBytes = this.hexToBytes(hex);
        }

        // 动态截断 (Dynamic Truncation)
        const offset = digestBytes[digestBytes.length - 1] & 0x0f;
        const binary =
            ((digestBytes[offset] & 0x7f) << 24) |
            ((digestBytes[offset + 1] & 0xff) << 16) |
            ((digestBytes[offset + 2] & 0xff) << 8) |
            (digestBytes[offset + 3] & 0xff);

        const otp = binary % Math.pow(10, this._digits);
        return otp.toString().padStart(this._digits, '0');
    }

    /**
     * 验证提供的 OTP 是否与指定计数器值生成的 OTP 匹配
     * @param otp - 要验证的 OTP (字符串)
     * @param counter - 用于生成预期 OTP 的计数器值
     * @returns 验证结果 (true 或 false)
     */
    verify(otp: string, counter: number): boolean {
        if (typeof otp !== 'string' || !/^\d+$/.test(otp)) {
            return false;
        }
        const expectedOtp = this.generate(counter);
        return otp === expectedOtp;
    }

    // --- 辅助方法 ---

    /**
     * 将整数转换为 8 字节的 Uint8Array (大端序)
     */
    private intTo8Bytes(counter: number): Uint8Array<any> {
        const bytes = new Uint8Array(8);
        for (let i = 7; i >= 0; i--) {
            bytes[i] = counter & 0xff;
            counter = counter >>> 8;
        }
        return bytes;
    }

    /**
     * 将 Uint8Array 转为十六进制字符串
     */
    private bytesToHex(bytes: Uint8Array<any>): string {
        return Array.from(bytes)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    /**
     * 将十六进制字符串转为 Uint8Array
     */
    private hexToBytes(hex: string): Uint8Array<any> {
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) {
            bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
        }
        return bytes;
    }

    // --- 便捷方法 ---

    next(): string {
        this._counter++;
        return this.generate();
    }

    getConfiguration(): {
        secret: string;
        counter: number;
        digits: number;
        algorithm: 'sha1' | 'sha256' | 'sha512' | 'sm3';
    } {
        return {
            secret: this._secret,
            counter: this._counter,
            digits: this._digits,
            algorithm: this._algorithm,
        };
    }
}