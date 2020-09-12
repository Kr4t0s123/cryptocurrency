const crypto = require('crypto')
const cryptoHash = (...inputs)=>{
    const hash = crypto.createHash('sha256').update(inputs.map(input=>JSON.stringify(input)).sort().join('')).digest('hex');
    return hash
}

module.exports = cryptoHash