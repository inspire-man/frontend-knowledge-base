# A1 手写 Promise(A+ 完整实现)

> 附录 A · 手写系列
> 思路:状态机 + 回调队列 + 链式穿透(每次 then 返回新 Promise)

---

## 一、核心机制回顾

Promise 三件事:

1. **状态机**:`pending → fulfilled/rejected`,只能变一次
2. **回调队列**:`then` 时若还 pending,把回调存起来,状态确定后批量执行
3. **链式穿透**:`then` **总是返回新 Promise**,所以能 `.then().then()`

---

## 二、完整实现(含 thenable 解析 + 静态方法)

```js
const PENDING = "pending", FULFILLED = "fulfilled", REJECTED = "rejected";

class MyPromise {
  constructor(executor) {
    this.state = PENDING;
    this.value = undefined;      // 结果值 / 失败原因
    this.callbacks = [];         // { onFulfilled, onRejected, resolve, reject }

    const resolve = (v) => this._settle(FULFILLED, v);
    const reject = (e) => this._settle(REJECTED, e);

    try { executor(resolve, reject); } catch (e) { reject(e); }
  }

  _settle(state, value) {
    if (this.state !== PENDING) return;      // 状态只能变一次
    // thenable 递归解析(值若是 Promise,等待它)
    if (state === FULFILLED && value && typeof value.then === "function") {
      return value.then(
        (v) => this._settle(FULFILLED, v),
        (e) => this._settle(REJECTED, e)
      );
    }
    this.state = state;
    this.value = value;
    // 异步执行回调(微任务语义)
    queueMicrotask(() => this.callbacks.forEach((cb) => this._run(cb)));
  }

  _run(cb) {
    const handler = this.state === FULFILLED ? cb.onFulfilled : cb.onRejected;
    if (typeof handler !== "function") {
      // 值穿透:没传处理函数,直接把结果传给下一个
      (this.state === FULFILLED ? cb.resolve : cb.reject)(this.value);
      return;
    }
    try {
      cb.resolve(handler(this.value));   // 返回值会经 thenable 解析
    } catch (e) {
      cb.reject(e);
    }
  }

  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      this.callbacks.push({ onFulfilled, onRejected, resolve, reject });
      // 已确定状态,立即调度执行
      if (this.state !== PENDING) {
        queueMicrotask(() => {
          const cb = this.callbacks.shift();
          this._run(cb);
        });
      }
    });
  }

  catch(onRejected) { return this.then(undefined, onRejected); }

  finally(onFinally) {
    return this.then(
      (v) => MyPromise.resolve(onFinally()).then(() => v),
      (e) => MyPromise.resolve(onFinally()).then(() => { throw e; })
    );
  }

  static resolve(v) {
    return v instanceof MyPromise ? v : new MyPromise((r) => r(v));
  }
  static reject(e) { return new MyPromise((_, r) => r(e)); }

  static all(list) {
    return new MyPromise((resolve, reject) => {
      const res = []; let count = 0;
      [...list].forEach((p, i) =>
        MyPromise.resolve(p).then(
          (v) => { res[i] = v; if (++count === list.length) resolve(res); },
          reject
        )
      );
    });
  }

  static race(list) {
    return new MyPromise((resolve, reject) =>
      [...list].forEach((p) => MyPromise.resolve(p).then(resolve, reject))
    );
  }

  static allSettled(list) {
    return new MyPromise((resolve) => {
      const res = []; let count = 0;
      [...list].forEach((p, i) =>
        MyPromise.resolve(p).then(
          (v) => { res[i] = { status: "fulfilled", value: v }; if (++count === list.length) resolve(res); },
          (e) => { res[i] = { status: "rejected", reason: e }; if (++count === list.length) resolve(res); }
        )
      );
    });
  }
}
```

---

## 三、A+ 规范的关键点(面试必答)

| 要点 | 说明 |
|------|------|
| 状态一次性 | `_settle` 里 `state !== PENDING` 直接 return |
| then 返回新 Promise | `then` 里 `return new MyPromise(...)` |
| 值穿透 | 没传 onFulfilled/onRejected 时,结果透传给下一个 |
| thenable 递归解析 | 值若是 Promise,等待它(递归 `_settle`) |
| 异常转 reject | executor / handler 抛错都 `reject` |
| 回调异步执行 | `queueMicrotask` 保证微任务语义(不用 setTimeout) |

---

## 四、易错点

1. **忘记返回新 Promise**:`then` 不返回新 Promise,链式就断了
2. **状态判断缺失**:`resolve` 后 `reject` 还会执行 → 加 `state !== PENDING` 守卫
3. **handler 返回值没递归解析**:若 handler 返回 Promise,下一个 then 应等它
4. **同步 then 重复执行**:已确定状态时,`then` 也要走队列(避免重复/顺序错)

---

## 五、自测

```js
const p = new MyPromise((resolve) => setTimeout(() => resolve(1), 100));
p.then((v) => v + 1)
 .then((v) => { console.log(v); return MyPromise.resolve(v * 2); })  // 2
 .then((v) => console.log(v));                                       // 4
```

---

📎 官方:Promises/A+ 规范 https://promisesaplus.com/