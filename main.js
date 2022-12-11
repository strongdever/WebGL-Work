class Trikotnik {

  constructor(v0,v1,v2,distFromCam,fragColors,lastV0,lastV1,lastV2) {
    this.v0 = v0;
    this.v1 = v1;
    this.v2 = v2;
    this.distFromCam = distFromCam;
    this.fragColors = fragColors
    this.lastV0 = lastV0;
    this.lastV1 = lastV1;
    this.lastV2 = lastV2;
  }

}

var vectors = {};
var faces = {};
var stV = 0;
var stF = 0;
var lights = {};
var lightVectors = {};
var norVectors = {};
const c = document.getElementById("platno");
const ctx = c.getContext("2d");
var depths = Array(2*c.width).fill().map(() => Array(2*c.height).fill(Number.MAX_VALUE));

var poracunaj = function () {

  var tMatrix = new Matrix(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  var trikotniki = [];
  depths = Array(2*c.width).fill().map(() => Array(2*c.height).fill(Number.MAX_VALUE));
  //var centerX = dx*c.clientWidth;
  //var centerY = dy*c.clientHeight;

  dx = document.getElementById("sliderTrX").value/100;
  dy = document.getElementById("sliderTrY").value/100;
  dz = document.getElementById("sliderTrZ").value/100;

  sx = document.getElementById("sliderScX").value / 100;
  sy = document.getElementById("sliderScY").value / 100;
  sz = document.getElementById("sliderScZ").value / 100;

  alphaX = toRad(document.getElementById("sliderX").value);
  alphaY = toRad(document.getElementById("sliderY").value);
  alphaZ = toRad(document.getElementById("sliderZ").value);

  cdx = document.getElementById("sliderCTrX").value/100;
  cdy = document.getElementById("sliderCTrY").value/100;
  cdz = document.getElementById("sliderCTrZ").value/100;

  calphaX = toRad(document.getElementById("sliderCX").value);
  calphaY = toRad(document.getElementById("sliderCY").value);
  calphaZ = toRad(document.getElementById("sliderCZ").value);

  //koor = [dx,dy,dz,1];

  //koor = remap(koor,0,800,-1,1);
  //console.log(koor);

  var camMatrix = new Matrix(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);

  //rotacija kamere
  camMatrix = camMatrix.mult(rotateNegX(camrx + calphaX),rotateNegY(camry + calphaY));
  camMatrix = camMatrix.mult(camMatrix, rotateNegZ(camrz + calphaZ));
  //console.log(tMatrix);

  //translacija kamere
  camMatrix = camMatrix.mult(camMatrix, translate(-camdx-cdx,-camdy-cdy,-camdz-cdz));

  //console.log(camMatrix);


  var modelMatrix = new Matrix(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);

  //translacija predmeta
  modelMatrix = modelMatrix.mult(modelMatrix,translate(+dx + +modx, +dy + +mody, +dz + +modz));

   //rotacija predmeta
   modelMatrix = modelMatrix.mult(modelMatrix, rotateZ(+alphaZ + +morz));
   modelMatrix = modelMatrix.mult(modelMatrix, rotateY(+alphaY + +mory));
   modelMatrix = modelMatrix.mult(modelMatrix, rotateX(+alphaX + +morx));

  //console.log("after",tMatrix);
  //skaliranje predmeta
  modelMatrix = modelMatrix.mult(modelMatrix, scale(sx*mosx,sy*mosy, sz*mosz));


  // //translacija predmeta
  // tMatrix = tMatrix.mult(tMatrix,translate(+dx + +modx, +dy + +mody, +dz + +modz));

  //  //rotacija predmeta
  //  tMatrix = tMatrix.mult(tMatrix, rotateX(+alphaX + +morx));
  //  tMatrix = tMatrix.mult(tMatrix, rotateY(+alphaY + +mory));
  //  tMatrix = tMatrix.mult(tMatrix, rotateZ(+alphaZ + +morz));

  // //console.log("after",tMatrix);
  // //skaliranje predmeta
  // tMatrix = tMatrix.mult(tMatrix, scale(sx*mosx,sy*mosy, sz*mosz));

  //kamera in model
  tMatrix = tMatrix.mult(camMatrix,modelMatrix);

  //perspektiva
  tMatrix = tMatrix.mult(perspective(d),tMatrix);

  //console.log(tMatrix);
  // pCoor = vec4.fromValues(0,0,4,1);
  // pCoor = remap(pCoor,0,800,-1,1);
  //mat4.multiply(tMatrix,tMatrix,perspective(4));

  var len = Object.keys(faces).length;
  for (var i = 0; i < len; i++) {
    var face = faces[i];
    v0 = clone(vectors[face[0]]);
    v1 = clone(vectors[face[1]]);
    v2 = clone(vectors[face[2]]);

    let v0T = transform(v0, modelMatrix);
    let v1T = transform(v1, modelMatrix);
    let v2T = transform(v2, modelMatrix);

    v0T.pop();
    v1T.pop();
    v2T.pop();

    //console.log(v0T,v1T,v2T);
    
    v0T = normalise(v0T);
    v1T = normalise(v1T);
    v2T = normalise(v2T);

    let v0C = transform(v0, camMatrix);
    let v1C = transform(v1, camMatrix);
    let v2C = transform(v2, camMatrix);

    v0C.pop();
    v1C.pop();
    v2C.pop();

    v0C = normalise(v0C);
    v1C = normalise(v1C);
    v2C = normalise(v2C);


    //console.log(v0T,v1T,v2T);

    v0 = transform(v0, tMatrix);
    v1 = transform(v1, tMatrix);
    v2 = transform(v2, tMatrix);
    //console.log("b",v0);
    lastV0 = v0;
    lastV1 = v1;
    lastV2 = v2;
    v0 = homogenize(v0);
    v1 = homogenize(v1);
    v2 = homogenize(v2);

    let tezisce = skaliraj(1/3,sestej(sestej(v0T,v1T),v2T));
    let distFromCam = Math.sqrt(Math.abs(Math.pow(tezisce[0]-camdx,2) + Math.pow(tezisce[1]-camdy,2) + Math.pow(tezisce[2]-camdz,2)));

    //console.log(transformedV);
    // v0 = remap(v0, -150, 150, -1, 1);
    // v1 = remap(v1, -150, 150, -1, 1);
    // v2 = remap(v2, -150, 150, -1, 1);
    //console.log("a",v0);
    //console.log(v0);
    //console.log(lights[0]);

    n0 = clone(norVectors[face[0]]);
    n1 = clone(norVectors[face[1]]);
    n2 = clone(norVectors[face[2]]);

    var rotMat = new Matrix(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    rotMat = rotMat.mult(rotMat, rotateX(+alphaX + +morx));
    rotMat = rotMat.mult(rotMat, rotateY(+alphaY + +mory));
    rotMat = rotMat.mult(rotMat, rotateZ(+alphaZ + +morz));

    n0 = transform(n0, rotMat);
    n1 = transform(n1, rotMat);
    n2 = transform(n2, rotMat);

    n0.pop();
    n1.pop();
    n2.pop();

    n0 = normalise(n0);
    n1 = normalise(n1);
    n2 = normalise(n2);


    //console.log("n0",n0);


    // N = [n0,n1,n2];
    // V = [v0,v1,v2];
    //console.log(matShininess);
    fragColor1 = calculatePhong(n0,v0T,matColor,matShininess);
    fragColor2 = calculatePhong(n1,v1T,matColor,matShininess);
    fragColor3 = calculatePhong(n2,v2T,matColor,matShininess);
    // v0[3] = lastV0;
    // v1[3] = lastV1;
    // v2[3] = lastV2;

    trikotniki.push(new Trikotnik(v0,v1,v2,distFromCam,[fragColor1,fragColor2,fragColor3],lastV0,lastV1,lastV2));

   //console.log(fragColor1,fragColor2,fragColor3)
    // finalColor[0] = Math.abs(finalColor[0]);
    // finalColor[1] = Math.abs(finalColor[1]);
    // finalColor[2] = Math.abs(finalColor[2]);

    // for(let i=0;i<finalColor.length;i++){
    //   if(finalColor[i] < 0.0){
    //     //console.log("before",finalColor);
    //     finalColor[i] = 0.0;
    //     //console.log("after",finalColor);
    //   }
    // }
    // if(jeNegativen(finalColor)){
    //   console.log("barva",finalColor);
    // }

    //console.log(vst2);
   
  }
  if(document.getElementById('slikar').checked) {
    trikotniki.sort((a, b) => {
      return b.distFromCam - a.distFromCam;
    });
  }
  //console.log(trikotniki);
  console.log(len);
  izris(trikotniki,len);
};

var izris = function(trikotniki,len){ 
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.strokeStyle = "black";
  ctx.linewidth = 1;


  // let px = wv1*xv1 + wv2*xv2 + wv3*xv3;
  // let py = wv1*yv1 + wv2*yv2 + wv3*yv3;


    if(document.getElementById('rasterizacija').checked) {
      for (var i = 0; i < len; i++) {
        narisiTrikotnik(trikotniki[i]);
      }
    }
    else {
      for (var i = 0; i < len; i++) {
        let fragColor1 = trikotniki[i].fragColors[0];
        let fragColor2 = trikotniki[i].fragColors[1];
        let fragColor3 = trikotniki[i].fragColors[2];

        let v0 = trikotniki[i].v0;
        let v1 = trikotniki[i].v1;
        let v2 = trikotniki[i].v2;
        //console.log(trikotniki[i]);


        let vst1 = sestej(fragColor1,fragColor2);
        let vst2 = sestej(vst1,fragColor3);
        //console.log("vst2",vst2);
        finalColor = skaliraj((255/3),vst2);


      
        var gradient = ctx.createLinearGradient(c.width / 2 + v0[0],c.height / 2 + v0[1],c.width / 2 + v1[0],c.height / 2 + v1[1]);
        gradient.addColorStop(0,"rgba(R,G,B,1)".replace("R",fragColor1[0]*255).replace("G",fragColor1[1]*255).replace("B",fragColor1[2]*255));
        gradient.addColorStop(1,"rgba(R,G,B,1)".replace("R",fragColor2[0]*255).replace("G",fragColor2[1]*255).replace("B",fragColor2[2]*255));
        if(!document.getElementById('crte').checked) {
          ctx.fillStyle = "rgba(R,G,B,1)".replace("R",finalColor[0]).replace("G",finalColor[1]).replace("B",finalColor[2]);
        }
        ctx.beginPath();
        ctx.moveTo(c.width / 2 + v0[0], c.height / 2 + v0[1]);
        ctx.lineTo(c.width / 2 + v1[0], c.height / 2 + v1[1]);
        ctx.strokeStyle = gradient;
        ctx.stroke();
      
        gradient = ctx.createLinearGradient(c.width / 2 + v1[0],c.height / 2 + v1[1],c.width / 2 + v2[0],c.height / 2 + v2[1]);
        gradient.addColorStop(0,"rgba(R,G,B,1)".replace("R",fragColor2[0]*255).replace("G",fragColor2[1]*255).replace("B",fragColor2[2]*255));
        gradient.addColorStop(1,"rgba(R,G,B,1)".replace("R",fragColor3[0]*255).replace("G",fragColor3[1]*255).replace("B",fragColor3[2]*255));
      
        ctx.lineTo(c.width / 2 + v2[0], c.height / 2 + v2[1]);
        console.log(c.width / 2 + v2[0], c.height / 2 + v2[1] + "_+_++_+_+_+_+_");
        console.log(i);
        ctx.strokeStyle = gradient;
        ctx.stroke();
      
        gradient = ctx.createLinearGradient(c.width / 2 + v2[0],c.height / 2 + v2[1],c.width / 2 + v0[0],c.height / 2 + v0[1]);
        gradient.addColorStop(0,"rgba(R,G,B,1)".replace("R",fragColor3[0]*255).replace("G",fragColor3[1]*255).replace("B",fragColor3[2]*255));
        gradient.addColorStop(1,"rgba(R,G,B,1)".replace("R",fragColor1[0]*255).replace("G",fragColor1[1]*255).replace("B",fragColor1[2]*255));
      
        ctx.lineTo(c.width / 2 + v0[0], c.height / 2 + v0[1]);
        if(!document.getElementById('crte').checked) {
          ctx.fill();
        }
        else{
          ctx.stroke();
        }

        ctx.strokeStyle = gradient;
        ctx.stroke();
      }
    //console.log(trikotniki[i]);

  }
  let t = 0;

}

function narisiTrikotnik(trikotnik){
    //console.log(trikotnik);
    //let izhod = 0;

    let A = trikotnik.v0;
    let B = trikotnik.v1;
    let C = trikotnik.v2;
    //console.log(trikotnik,A,B,C);
    let Ax = A[0];
    let Ay = A[1];
    let Bx = B[0];
    let By = B[1];
    let Cx = C[0];
    let Cy = C[1];  

    let vst1 = sestej(trikotnik.fragColors[0],trikotnik.fragColors[1]);
    let vst2 = sestej(vst1,trikotnik.fragColors[2]);
    let finalColor = skaliraj((255/3),vst2);

    let minx = Math.floor(Math.min(A[0],Math.min(B[0],C[0])));
    let maxx = Math.ceil(Math.max(A[0],Math.max(B[0],C[0])));
    let miny = Math.floor(Math.min(A[1],Math.min(B[1],C[1])));
    let maxy = Math.ceil(Math.max(A[1],Math.max(B[1],C[1])));

    let qa = 1/A[3];
    let qb = 1/B[3];
    let qc = 1/C[3];
    // let qa = d/A[2];
    // let qb = d/B[2];
    // let qc = d/C[2];

    let Vac = skaliraj(qa,A);
    let Vbc = skaliraj(qb,B);
    let Vcc = skaliraj(qc,C);

    //console.log(Vac,Vbc,Vcc);
    
    for(let Ty=miny;Ty<maxy;Ty++){   

      for(let Tx=minx;Tx<maxx;Tx++){
      //izhod = 0;
    
        let alpha = (((By-Cy)*(Tx-Cx)) + ((Cx-Bx)*(Ty-Cy)))/(((By-Cy)*(Ax-Cx)) + ((Cx-Bx)*(Ay-Cy)));
        let beta = (((Cy-Ay)*(Tx-Cx)) + ((Ax-Cx)*(Ty-Cy)))/(((By-Cy)*(Ax-Cx)) + ((Cx-Bx)*(Ay-Cy)));
        let gamma = 1 - alpha - beta;

        
        //console.log(Vac,Vbc,Vcc);
    
        let Vpc = sestej(sestej(skaliraj(alpha,Vac),skaliraj(beta,Vbc)),skaliraj(gamma,Vcc));
        let qp = alpha*(qa) + beta*(qb)+ gamma*(qc);
        let Vp = skaliraj((1/qp),Vpc);

        let V = [...Vp];

        let AV = odstej(V,A);
        let AC = odstej(C,A);
        let CV = odstej(V,C);
        let CB = odstej(B,C);
        let BV = odstej(V,B);
        let BA = odstej(A,B);

        //console.log(AV);

        let AVAC = cross(AV,AC);
        let BVBA = cross(BV,BA);
        let CVCB = cross(CV,CB);

        //console.log(AVAC,BVBA,CVCB);
        if(AVAC[2] > 0 && BVBA[2] > 0 && CVCB[2] > 0){
           let x = Math.round(Tx + c.width / 2);
           let y = Math.round(Ty + c.height / 2);
          if(V[2] < depths[x][y]){
            ctx.fillStyle = "rgba(R,G,B,1)".replace("R",finalColor[0]).replace("G",finalColor[1]).replace("B",finalColor[2]);
            ctx.fillRect( x, y , 1, 1);
            depths[x][y] = V[2];
         }
        }
        // else{
        //   izhod = 1;
        //   continue;
        // }
      }
      // if(izhod == 1){
      //   continue;
      // }
    }
    

    // console.log("wv1",wv1,"wv2",wv2,"wv3",wv3);
    //console.log(v0T,v1T,v2T,camdx,camdy);
  // let V = alpha*A/(d*z) + beta*B/(d*z) + gamma*C/(d*z);
  // V = A;
  // V.z = A.z;
  // V = B;
  // V.z = B.z;
  
}

function cross(a,b){
  return new Array(a[1]*b[2] - a[2]*b[1],a[2]*b[0] - a[0]*b[2],a[0]*b[1] - a[1]*b[0]);
}

var readInput = function (e) {
  console.log("sed");
  const scene = SceneReader.readFromJson(input.value);
  vertices = scene.vertices;
  indices = scene.indices;
  normals = scene.normals;
  lights = scene.lights;
  //console.log(vertices.length + " in " + indices.length);
  for (var i = 0; i < vertices.length; i++) {
    if (i % 3 == 0) {
      vectors[stV] = [vertices[i], vertices[i + 1], vertices[i + 2], 1.0];
      stV++;
    }
  }

  let stN = 0;
  for (var i = 0; i < normals.length; i++) {
    if (i % 3 == 0) {
      norVectors[stN] = [normals[i], normals[i + 1], normals[i + 2], 0.0];
      stN++;
    }
  }

  for (var i = 0; i < lights.length; i++) {
    let curr = lights[i].position;
    //curr.push(0.0);
    lightVectors[i] = curr;
  }
  //console.log(lightVectors);
  camdx = scene.camera.translation[0];
  camdy = scene.camera.translation[1];
  camdz = scene.camera.translation[2];
  camrx = scene.camera.rotation[0];
  camry = scene.camera.rotation[1];
  camrz = scene.camera.rotation[2];
  modx = scene.model.translation[0];
  mody = scene.model.translation[1];
  modz = scene.model.translation[2];
  morx = scene.model.rotation[0];
  mory = scene.model.rotation[1];
  morz = scene.model.rotation[2];
  mosx = scene.model.scale[0];
  mosy = scene.model.scale[1];
  mosz = scene.model.scale[2];
  d = scene.camera.perspective;

  matColor = scene.material.color;
  // matColor[0] *= 255;
  // matColor[1] *= 255;
  // matColor[2] *= 255;
  matShininess = scene.material.shininess;
  lights = scene.lights;
  normals = scene.normals;


  /*if(typeof vectors[stV] == "undefined"){
        console.log(stV);
      }
      console.log(vectors[506]);
      console.log(Object.keys(vectors).length);*/
console.log("indices : " + indices.length);
  for (i = 0; i < indices.length; i++) {
    if (i % 3 == 0) {
      faces[stF] = [indices[i], indices[i + 1], indices[i + 2], 1.0];
      stF++;
    }
  }
  console.log("stv : " + stV);
  console.log("stF : " + stF);
  /*console.log(faces[967]);
      console.log(Object.keys(faces).length);*/

  //console.log(faces[stF-1]);

  poracunaj();
  //console.log(vectors);
};

function calculatePhong(N,V,matColor,matShininess){

  let color = [0.0,0.0,0.0];
  //console.log(lightVectors);
  //console.log("To je v",V);
  for(let i=0;i<lights.length;i++){
    let L = normalise(odstej(lightVectors[i],V));
    //console.log(lightVectors[i]);
    //console.log("luci",L);
    let c = lights[i].color;
    let S = matShininess;
    let R = reflect(L,N);
    //R = normalise(R);
    //console.log(R);
    let Lambert = Math.max(dot(L,N),0);
    //console.log(Lambert);
    //console.log("R",R,"V",V);
    let cam = [camdx,camdy,camdz];
    let dotRV = Math.max(dot(R,normalise(odstej(cam,V))),0);
    //console.log("L",L,"N",N,"R",R,"V",V);
    //console.log("dotrv",dotRV,"S",S);
    let Phong = Math.pow(dotRV,S);
    //console.log("Phong",Phong);
    let sestevek = Lambert + Phong;
    //console.log("ses",sestevek,"c",c);
    let zmn1 = skaliraj(sestevek,c);
    //console.log("z1",zmn1);
    let zmn2 = poKomponentah(zmn1,matColor);
    //console.log("z2",zmn2);
    color = sestej(color,zmn2);
  }

  //console.log("z1",zmn1);
  //console.log("z2",zmn2);

  // let pl = lights[0].position;
  // let cl = lights[0].color;

  // let ks = [0.9,0.9,0.9];
  // let p = lights[0].shinines;

  // N = normalise(N);
  // let L = normalise(pl-v);
  // let dotnl = dot(N,L);
  // let color = [0.0,0.0,0.0];
  // if(dotnl > 0.0){
  //   color += cl*kd*dotnl;
  //   let R = -reflect(L,N);
  //   let e = normalize(-v);
  //   color += cl*ks*Math.pow(Math.max(0.0,dot(R,e),p));
    
  // }

  // color.push(1.0);
  //console.log(color);
  return color;
  



  // for(let i=0;i<lights.length;i++){
  //   let ca = lights[i].
  //   //console.log(lights[i]);
  //   c = ca* + Ei ciRd(ii • n) + ks(Ri • OP) 
  // }
  // return c;
  

}

function reflect(L,N){
  let dotln = dot(L,N);
  let skalirano = 2*dotln;
  //console.log("skalirano",skalirano);
  let produkt  = skaliraj(skalirano,N);
  // console.log("produkt",produkt);
  //console.log("produkt L",produkt,L);
  let R = odstej(produkt,L);
  //console.log("R",R);

  return R;
}

function poKomponentah(v1,v2){
  let out = [...v1];
  for(let i=0;i<v1.length;i++){
    out[i] = v1[i] * v2[i];
  }

  return out;
}

function skaliraj(skalar,vektor){
  var out = [...vektor];
  for(let i=0;i<vektor.length;i++){
    out[i] = vektor[i] * skalar;
  }
  return out;
}

function sestej(vektor,vektor2){
  var out = [...vektor];

  for(let i=0;i<vektor.length;i++){
    out[i] += vektor2[i];
  }
  return out;
}
function odstej(vektor,vektor2){
  var out = [...vektor];
  for(let i=0;i<vektor.length;i++){
    out[i] = vektor[i] -  vektor2[i];
  }
  return out;
}

function jeNegativen(vektor){
  for(let i=0;i<vektor.length;i++){
    if(vektor[i] < 0){
      return true;
    }
  }
  return false;
}


// transpose = m => m[0].map((x,i) => m.map(x => x[i]));

function transform(a, m) {
  var out = [0.0,0.0,0.0,0.0]
  var x = a[0],
    y = a[1],
    z = a[2],
    w = a[3];
  mArray = m.toArray();
  for (var i = 0; i < 4; i++) {
    out[i] =
      mArray[(i*4)] * x +
      mArray[(i*4) + 1] * y +
      mArray[(i*4) + 2] * z +
      mArray[(i*4) + 3] * w;
  }
  return out;
}

function homogenize(v) {
  var out = [...v];
  for (i = 0; i < 3; i++) {
    if (v[3] != 1) {
        out[i] /= out[3];
    }
  }
  return out;
}

function normalise(v){
  let out = [...v];
  let x = v[0];
  let y = v[1];
  let z = v[2];

  let dolzina = Math.sqrt(x*x + y*y + z*z);
  for(let i=0;i<out.length;i++){
    out[i]  = v[i] / dolzina;
  }

  return out;
}

function dot(v1,v2){
  let sum = 0;
  for(let i=0;i<v1.length;i++){
    sum += v1[i]*v2[i];
  }
  return sum
}

// function interpolateNormal(gradient,a, b){
//   return a.add((b.minus(a)).multiply(gradient));
// }

// function rgbToHex(r, g, b) {
//   return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
// }

function remap(v, amin, amax, alow, ahigh) {
  out = new Float32Array(4);
  for (i = 0; i < 4; i++) {
    out[i] = amin + ((v[i] - alow) * (amax - amin)) / (ahigh - alow);
  }
  return out;
}

function clone(a) {
  var out = new Float32Array(4);
  for (i = 0; i < 4; i++) {
    out[i] = a[i];
  }
  return out;
}

function toRad(alpha) {
  return (alpha * 2 * Math.PI) / 360;
}

function rotateX(alpha) {
  var m = new Matrix(
    1,
    0,
    0,
    0,
    0,
    Math.cos(alpha),
    -1.0 * Math.sin(alpha),
    0,
    0,
    Math.sin(alpha),
    Math.cos(alpha),
    0,
    0,
    0,
    0,
    1
  );
  return m;
}

function rotateY(alpha) {
  var m = new Matrix(
    Math.cos(alpha),
    0,
    Math.sin(alpha),
    0,
    0,
    1,
    0,
    0,
    -1.0 * Math.sin(alpha),
    0,
    Math.cos(alpha),
    0,
    0,
    0,
    0,
    1
  );
  return m;
}

function rotateZ(alpha) {
  var m = new Matrix(
    Math.cos(alpha),
    -1.0 * Math.sin(alpha),
    0,
    0,
    Math.sin(alpha),
    Math.cos(alpha),
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1
  );
  return m;
}

function translate(dx, dy, dz) {
  var m = new Matrix(1, 0, 0, dx, 0, 1, 0, dy, 0, 0, 1, dz, 0, 0, 0, 1);
  return m;
}

function scale(sx, sy, sz) {
  var m = new Matrix(sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1);
  return m;
}
function perspective(d) {
  var m = new Matrix(1, 0, 0, 0,
                     0, 1, 0, 0, 
                     0, 0, 1, 0,
                     0, 0, d, 0);
  return m;
}
function rotateNegX(alpha) {
  var m = new Matrix(
    1,
    0,
    0,
    0,
    0,
    Math.cos(alpha),
    Math.sin(alpha),
    0,
    0,
    -1.0 * Math.sin(alpha),
    Math.cos(alpha),
    0,
    0,
    0,
    0,
    1
  );
  return m;
}

function rotateNegY(alpha) {
  var m = new Matrix(
    Math.cos(alpha),
    0,
    -1.0 * Math.sin(alpha),
    0,
    0,
    1,
    0,
    0,
    Math.sin(alpha),
    0,
    Math.cos(alpha),
    0,
    0,
    0,
    0,
    1
  );
  return m;
}

function rotateNegZ(alpha) {
  var m = new Matrix(
    Math.cos(alpha),
    Math.sin(alpha),
    0,
    0,
    -1.0 * Math.sin(alpha),
    Math.cos(alpha),
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1
  );
  return m;
}
function translateNeg(dx, dy, dz) {
  var m = new Matrix(1, 0, 0, -dx, 0, 1, 0, -dy, 0, 0, 1, -dz, 0, 0, 0, 1);
  return m;
}
