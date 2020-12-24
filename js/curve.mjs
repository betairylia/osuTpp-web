function cObj(k, v)
{
    return { key: k, value: v }
}

const CurveNodeType =
{
    Step: 0,
    Linear: 1,
    Quadratic: 2,
}

const Interpolation =
    [
        (a, b, t) => { if (t === 1) { return b; } return a; },
        (a, b, t) => (1 - t) * a + t * b,
        (a, b, t) => 0, // Not supported.
    ]

class Curve
{
    constructor(length = 1)
    {
        // Red-Black Tree for faster queries (https://github.com/vadimg/js_bintrees)
        this.tree = new RBTree((a, b) => { return a.key - b.key });

        // Initialize the curve with constant 1
        this.Insert(0, 1, CurveNodeType.Step);
        this.Insert(length, 1, CurveNodeType.Step);
    }

    Insert(time, value, type)
    {
        this.tree.insert(cObj(time, [value, type]));
    }

    Query(time)
    {
        var iter = this.tree.lowerBound({ key: time }); // iter.data().time will >= time

        var r = iter.data();
        var l = iter.prev(); // prev() will modify iter ...

        if (r == null) { return l.value[0]; }
        else if (l == null) { return r.value[0]; }

        return Interpolation[r.value[1]](l.value[0], r.value[0], (time - l.key) / (r.key - l.key));
    }
}

export { CurveNodeType, Curve }
