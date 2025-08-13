import {HOTP} from "../src/core/hotp";
import {Algorithm} from "../src/core/default";

describe('hotp 测试', () => {
	test('hotp 测试', () => {
		async function demo() {
			const secret = 'JBSWY3DPEHPK3PXP'; // 示例 Base32 密钥

			const hotp = new HOTP(secret, 0, 6);

			console.log('SHA1 OTP:', hotp.generate());

			hotp.algorithm = Algorithm.SHA256;
			console.log('SHA256 OTP:', hotp.generate());

			hotp.algorithm = Algorithm.SHA512;
			console.log('SHA512 OTP:', hotp.generate());

			hotp.algorithm = Algorithm.SM3;
			console.log('SM3 OTP:', hotp.generate());

			// 验证
			hotp.algorithm = Algorithm.SM3;
			const otp = hotp.generate();
			console.log('Verify SM3 OTP:', hotp.verify(otp, hotp.counter)); // true
		}

		demo().catch(console.error);
	})
});