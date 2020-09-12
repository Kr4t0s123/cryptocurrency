const cryptoHash = require('./crypto-hash')

describe('cryptoHash()' ,()=>{

    it('generates a SHA-256 hashed output' , ()=>{
        expect(cryptoHash('foo')).toEqual("B2213295D564916F89A6A42455567C87C3F480FCD7A1C15E220F17D7169A790B".toLocaleLowerCase())
    })

    it('produces the same hash with same input parameter in any order' , ()=>{
        expect(cryptoHash('one','two','three')).toEqual(cryptoHash('one','three','two'))
    })

    it('produces a unique hash when the properties have changed on an input' ,()=>{
        const foo = {};
        const originalHash = cryptoHash(foo);
        foo['a'] = 'a'
        expect(cryptoHash(foo)).not.toEqual(originalHash)
    })
})