import * as CryptoJS from 'crypto-js';

export class HOTP {
    // 私有静态常量
    private static readonly BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

    /**
     * 生成HOTP验证码（公共静态方法）
     * @param secret - Base32编码的密钥
     * @param algorithm - 算法，默认SHA-1
     * @param counter - 计数器值
     * @param digits - 验证码位数，默认6位
     */
    public static generate(
        secret: string,
        counter: number,
        digits: number = 6,
        algorithm: string = 'sha1'
    ): string {
        // 1. Base32解码密钥
        const decodedKey = HOTP.base32Decode(secret);

        // 2. 计数器转为8字节大端序
        const buffer = new ArrayBuffer(8);
        const dataView = new DataView(buffer);
        dataView.setUint32(0, 0); // 高32位
        dataView.setUint32(4, counter); // 低32位

        // 3. 转为CryptoJS兼容格式
        const counterWordArray = CryptoJS.lib.WordArray.create(
            new Uint8Array(buffer)
        );

        // 4. 计算HMAC-sha1
        let hmac: CryptoJS.lib.WordArray;
        switch (algorithm.toUpperCase()) {
            case 'SHA256':
                hmac = CryptoJS.HmacSHA256(counterWordArray, decodedKey);
                break;
            case 'SHA512':
                hmac = CryptoJS.HmacSHA512(counterWordArray, decodedKey);
                break;
            default: // 默认使用sha1
                hmac = CryptoJS.HmacSHA1(counterWordArray, decodedKey);
        }

        // 5. 提取HMAC字节数组
        const byteArray = this.hmacToByteArray(hmac);

        // 6. 动态截断
        const offset = byteArray[19] & 0xf;
        if (offset + 3 >= byteArray.length) {
            throw new Error('动态截断错误：偏移量超出范围');
        }

        // 7. 计算一次性密码
        const binary = this.calculateBinaryCode(byteArray, offset);
        return (binary % (10 ** digits)).toString().padStart(digits, '0');
    }

    /**
     * 验证HOTP验证码
     * @param token - 待验证的令牌
     * @param secret - Base32编码的密钥
     * @param algorithm - 算法，默认SHA-1
     * @param counter - 计数器值
     * @param digits - 验证码位数，默认6位
     * @param window - 验证窗口数量，默认1
     */
    public static verify(
        token: string,
        secret: string,
        algorithm: string,
        counter: number,
        digits: number = 6,
        window: number = 1
    ): { success: boolean; delta: number | null } {
        for (let i = 0; i <= window; i++) {
            const currentCounter = counter + i;
            const generatedToken = HOTP.generate(secret, currentCounter, digits, algorithm);

            if (generatedToken === token) {
                return {success: true, delta: i};
            }
        }

        return {success: false, delta: null};
    }

    /**
     * Base32解码（私有方法）
     */
    private static base32Decode(b32: string): CryptoJS.lib.WordArray {
        const bytes: number[] = [];
        let bits = 0;
        let value = 0;

        for (let i = 0; i < b32.length; i++) {
            const char = b32[i].toUpperCase();
            if (char === '=') break; // 终止填充符
            const index = HOTP.BASE32_CHARS.indexOf(char);
            if (index === -1) continue; // 跳过无效字符

            value = (value << 5) | index;
            bits += 5;

            if (bits >= 8) {
                bits -= 8;
                bytes.push((value >>> bits) & 0xff);
            }
        }
        return CryptoJS.lib.WordArray.create(Uint8Array.from(bytes));
    }

    /**
     * 转换HMAC结果为字节数组
     */
    private static hmacToByteArray(
        hmac: CryptoJS.lib.WordArray
    ): Uint8Array<any> {
        const byteArray = new Uint8Array(20); // sha1输出20字节
        for (let i = 0; i < 20; i++) {
            const wordIndex = i >>> 2;
            const byteIndex = (3 - (i % 4)) * 8; // 大端序处理
            byteArray[i] = (hmac.words[wordIndex] >>> byteIndex) & 0xff;
        }
        return byteArray;
    }

    /**
     * 计算二进制验证码
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