const fib_rec = (n) => n < 2 ? n : fib_rec(n-1) + fib_rec(n-2);
let cache_fib = { [0]: 0, [1]: 1, [2]: 1 };
const fib = (n) => {
    if (cache_fib[n]) {
        return cache_fib[n]
    } else {
        const r = fib(n-1) + fib(n-2)
        cache_fib[n] = r
        return r
    }
}
const test = (str) => {
    console.log(`TEST: ${str} ==> ${eval(str)}`)
}

test("fib_rec(18) == fib(18)")
