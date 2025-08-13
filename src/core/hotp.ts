import * as CryptoJS from 'crypto-js';
import {sm3} from 'sm-crypto'; // 引入国密SM3算法库
import {Algorithm, Common} from "../utils/common";

export interface HOTPGenerateOptions {
    secret: string;
    counter: number;
    digits?: number;
    algorithm?: string;
}

export interface HOTPVerifyOptions {
    token: string,
    secret: string,
    counter: number,
    digits?: number,
    window?: number,
    algorithm?: string,
}

export class HOTP {
    /**
     * 生成HOTP验证码（支持SM3/SHA1/SHA256/SHA512）
     * @param options 配置参数
     * @param secret - Base32编码的密钥
     * @param algorithm - 算法，默认SHA-1
     * @param counter - 计数器值
     * @param digits - 验证码位数，默认6位
     */
    public static generate(
        {
            secret,
            counter,
            digits = Common.DEFAULT_DIGITS,
            algorithm = Algorithm.SHA1
        }: HOTPGenerateOptions
    ): string {
        if (!secret || counter < 0) {
            throw new Error("无效的参数：secret不能为空，counter必须为非负整数");
        }

        // 1. Base32解码密钥
        const decodedKey = Common.base32Decode(secret);
        const alg = algorithm?.toUpperCase() || Algorithm.SHA1;

        // 2. 计数器转为8字节大端序
        const counterBuffer = this.counterToBytes(counter);

        // 3. 根据算法选择HMAC实现
        let hmacBytes: Uint8Array<any>;
        if (alg === "Algorithm.SM3") {
            // 使用sm-crypto计算HMAC-SM3
            const keyBytes = Common.wordArrayToUint8Array(decodedKey);
            hmacBytes = this.hmacSMCompute(keyBytes, counterBuffer);
        } else {
            // 使用CryptoJS计算HMAC-SHA系列
            const counterWordArray = CryptoJS.lib.WordArray.create(counterBuffer);
            hmacBytes = this.hmacSHACompute(decodedKey, counterWordArray, alg);
        }

        // 4. 动态截断
        if (hmacBytes.length < 20) {
            throw new Error('HMAC输出长度不足，无法进行动态截断');
        }
        const offset = hmacBytes[19] & 0xf;
        if (offset + 3 >= hmacBytes.length) {
            throw new Error('动态截断错误：偏移量超出范围');
        }

        // 5. 计算一次性密码
        const binary = this.calculateBinaryCode(hmacBytes, offset);
        return (binary % (10 ** digits)).toString().padStart(typeof digits === "number" ? digits : Common.DEFAULT_DIGITS, '0');
    }

    /**
     * 验证HOTP验证码
     */
    public static verify({
                             token,
                             secret,
                             counter,
                             digits = Common.DEFAULT_DIGITS,
                             window = Common.DEFAULT_WINDOW,
                             algorithm = Algorithm.SHA1
                         }: HOTPVerifyOptions
    ): { success: boolean; delta: number | null } {
        if (!token || !secret || counter < 0 || window < 0) {
            return {success: false, delta: null};
        }

        for (let i = 0; i < window; i++) {
            const currentCounter = counter + i;
            const generatedToken = HOTP.generate({
                secret, counter: currentCounter, digits, algorithm
            });

            if (generatedToken === token) {
                return {success: true, delta: i};
            }
        }

        return {success: false, delta: null};
    }

    // ============== 私有方法 ==============

    /**
     * 计算HMAC-SM3（国密算法）
     */
    private static hmacSMCompute(
        key: Uint8Array<any>,
        message: Uint8Array<any>
    ): Uint8Array<any> {
        // 使用sm-crypto的HMAC-SM3实现
        const hmacHex = sm3(message, {key});

        // 十六进制转字节数组
        const bytes = new Uint8Array<any>(hmacHex.length / 2);
        for (let i = 0; i < hmacHex.length; i += 2) {
            bytes[i / 2] = parseInt(hmacHex.substr(i, 2), 16);
        }
        return bytes;
    }

    /**
     * 计算HMAC-SHA系列（使用CryptoJS）
     */
    private static hmacSHACompute(
        key: CryptoJS.lib.WordArray,
        message: CryptoJS.lib.WordArray,
        algorithm: string
    ): Uint8Array<any> {
        let hmac: CryptoJS.lib.WordArray;
        switch (algorithm) {
            // TODO
            // case Algorithm.SHA256:
            //     hmac = CryptoJS.HmacSHA256(message, key);
            //     break;
            // case Algorithm.SHA512:
            //     hmac = CryptoJS.HmacSHA512(message, key);
            //     break;
            default:
                hmac = CryptoJS.HmacSHA1(message, key);
        }

        const hashLengthMap: Record<string, number> = {
            SHA1: 20,
            // TODO
            // SHA256: 32,
            // SHA512: 64
        };

        const length = hashLengthMap[algorithm] || 20;

        // 转换为Uint8Array<any>
        const bytes = new Uint8Array<any>(hmac.sigBytes);
        for (let i = 0; i < bytes.length; i++) {
            bytes[i] = (hmac.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
        }
        return bytes;
    }

    /**
     * 计数器转字节数组（大端序）
     */
    private static counterToBytes(counter: number): Uint8Array<any> {
        const buffer = new ArrayBuffer(8);
        const view = new DataView(buffer);
        view.setUint32(0, Math.floor(counter / 0x100000000));
        view.setUint32(4, counter & 0xffffffff);
        return new Uint8Array<any>(buffer);
    }

    /**
     * 动态截断计算二进制码
     */
    private static calculateBinaryCode(
        byteArray: Uint8Array<any>,
        offset: number
    ): number {
        return (
            ((byteArray[offset] & 0x7f) << 24) |
            (byteArray[offset + 1] << 16) |
            (byteArray[offset + 2] << 8) |
            byteArray[offset + 3]
        );
    }
}
