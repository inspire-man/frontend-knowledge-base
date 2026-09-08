# A2 手写 call / apply / bind / new / instanceof

> 附录 A · 手写系列
> 思路:call/apply 靠"临时挂到对象上调用"改变 this;bind 再叠加柯里化 + 兼容 new。

---

## 一、call / apply(改变 this)

```js
Function.prototype.myCall = function (ctx, ...args) {
  ctx = ctx ?? globalThis;              // null/undefined 兜底
  const fn = Symbol("fn");              // 唯一 key,防覆盖
  ctx[fn] = this;                       // 把函数临时挂到 ctx 上 → 隐式绑定
  const res = ctx[fn](...args);
  delete ctx[fn];                       // 用完删除,不留痕迹
  return res;
};

Function.prototype.myApply = function (ctx, args = []) {
  return this.myCall(ctx, ...args);
};
```

> `obj.fn()` 时 this = obj(隐式绑定),所以"临时挂上去调用"就是最朴素实现。用 `Symbol` 避免污染/覆盖同名属性。

---

## 二、bind(柯里化 + 兼容 new)

```js
Function.prototype.myBind = function (ctx, ...args) {
  const self = this;
  const bound = function (...rest) {
    // new 调用时,this 是 bound 的实例(优先级 new > 显式绑定)
    return self.apply(this instanceof bound ? this : ctx, args.concat(rest));
  };
  // 让 bound 的原型指向 self,保证 instanceof 正确
  bound.prototype = Object.create(self.prototype);
  return bound;
};
```

**两个关键点:**

1. **柯里化**:`args.concat(rest)` 把"预置参数 + 调用时参数"合并
2. **兼容 new**:`new (fn.bind(obj))()` 时,this 应是新实例而非 obj(`this instanceof bound ? this : ctx`)

---

## 三、new(四步)

```js
function myNew(constructor, ...args) {
  const obj = Object.create(constructor.prototype);   // 1. 建对象,绑原型
  const res = constructor.apply(obj, args);           // 2. 以 obj 为 this 执行
  return res instanceof Object ? res : obj;           // 3. 有返回对象则用,否则 obj
}
```

---

## 四、instanceof(沿原型链找)

```js
function myInstanceof(obj, ctor) {
  let proto = Object.getPrototypeOf(obj);
  while (proto) {
    if (proto === ctor.prototype) return true;
    proto = Object.getPrototypeOf(proto);
  }
  return false;
}
```

---

## 五、Object.create(补)

```js
function myCreate(proto) {
  function F() {}
  F.prototype = proto;
  return new F();
}
```

---

## 六、易错点

1. **call 的 ctx 兜底**:`call(null)` 时 this 应是 globalThis(非严格模式)
2. **Symbol 临时 key**:避免覆盖 ctx 上已有的同名属性
3. **bind 忘记兼容 new**:直接 `self.apply(ctx, ...)` 会导致 new 时 this 错
4. **new 返回值的判断**:构造函数返回对象时,用返回值;返回原始值时,忽略、用新对象

---

## 七、自测

```js
function greet(g) { return g + this.name; }
console.log(greet.myCall({ name: "王" }, "hi "));   // "hi 王"
const bound = greet.myBind({ name: "北" }, "yo ");
console.log(bound());                               // "yo 北"

function P(n) { this.n = n; }
const p = myNew(P, 1);
console.log(p instanceof P, p.n);                   // true 1
```

---

📎 官方:MDN《Function.prototype.call/apply/bind》《instanceof》