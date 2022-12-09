class Matrix {

    constructor(...m) {
        this.m = new Array(16).fill(0)
        this.m.splice(0, m.length, ...m);
    }

    toArray() {
        return [...this.m];
    }

    toString() {
        return `(${this.m.join(',')})`;
    }

    mult(a,b){
        var out = new Matrix();
        var st = 0;
        for(var i=0;i<=12;i+=4){
            for(var j=0;j<4;++j){
                for(var k=0,st=0;k<4;++k,st +=4){
                    out.m[i+j] += a.m[i + k % 4]*b.m[st + j % 4];
                }                       
            }
        }
        return out;
    }

}