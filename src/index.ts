import {HOTP} from './core/hotp';
import {TOTP} from './core/totp';
import {Common, Algorithm} from './utils/common'

export {HOTP, TOTP, Algorithm, Common};

const notp = {
    HOTP,
    TOTP,
    Algorithm,
    Common
};

export default notp;