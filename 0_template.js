/**
 * 防抖 执行最后一次
 * @param {number} delay 时延
 * @param {Function} fn func
 * @returns {Function} func
 */
function debounce(delay, fn) {
    let timerId = null;
    return (...args) => {
        clearTimeout(timerId);
        timerId = setTimeout(() => {
            fn(...args);
            timerId = null;
        }, delay);
    }
};

/**
 * 节流 执行第一次
 * @param {number} delay 时延
 * @param {Function} fn func
 * @returns {Function} func
 */
function throttle(delay, fn) {
    let cd = false;
    return (...args) => {
        if (cd) { return; }
        cd = true;
        fn(...args);
        setTimeout(() => {
            cd = false;
        }, delay);
    }
};