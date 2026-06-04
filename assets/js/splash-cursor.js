(function initSplashCursor() {
  if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;
  if (window.self !== window.top) return;

  // Sembunyikan native cursor
  const s = document.createElement('style');
  s.textContent = 'html,body,*,*::before,*::after{cursor:none!important;}';
  document.head.appendChild(s);

  // Canvas overlay
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:99999;pointer-events:none;display:block;';
  document.body.appendChild(canvas);

  // Titik kecil tracking cursor
  const dot = document.createElement('div');
  dot.style.cssText = `
    position:fixed;z-index:100000;pointer-events:none;
    width:5px;height:5px;border-radius:50%;
    background:rgba(255,255,255,0.9);
    box-shadow:0 0 6px rgba(147,197,253,0.8), 0 0 12px rgba(96,165,250,0.4);
    transform:translate(-50%,-50%);
    left:-100px;top:-100px;
    transition:opacity 0.3s, width 0.15s, height 0.15s;
  `;
  document.body.appendChild(dot);

  const config = {
    SIM_RESOLUTION: 128, DYE_RESOLUTION: 1440,
    DENSITY_DISSIPATION: 3.5, VELOCITY_DISSIPATION: 2,
    PRESSURE: 0.1, PRESSURE_ITERATIONS: 20, CURL: 3,
    SPLAT_RADIUS: 0.2, SPLAT_FORCE: 6000, SHADING: true,
    COLOR_UPDATE_SPEED: 10, TRANSPARENT: true,
    BACK_COLOR: { r: 0, g: 0, b: 0 }
  };

  function pointerProto() { this.id=-1;this.texcoordX=0;this.texcoordY=0;this.prevTexcoordX=0;this.prevTexcoordY=0;this.deltaX=0;this.deltaY=0;this.down=false;this.moved=false;this.color=[0,0,0]; }
  let pointers = [new pointerProto()];

  const params = { alpha:true, depth:false, stencil:false, antialias:false, preserveDrawingBuffer:false };
  let gl = canvas.getContext('webgl2', params);
  const isWebGL2 = !!gl;
  if (!gl) gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params);
  if (!gl) return;

  let halfFloat, supportLinearFiltering;
  if (isWebGL2) {
    gl.getExtension('EXT_color_buffer_float');
    supportLinearFiltering = gl.getExtension('OES_texture_float_linear');
  } else {
    halfFloat = gl.getExtension('OES_texture_half_float');
    supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear');
  }
  gl.clearColor(0,0,0,1);

  const halfFloatTexType = isWebGL2 ? gl.HALF_FLOAT : halfFloat?.HALF_FLOAT_OES;

  function getSupportedFormat(gl, internalFormat, format, type) {
    if (!supportRTF(gl, internalFormat, format, type)) {
      if (internalFormat === gl.R16F) return getSupportedFormat(gl, gl.RG16F, gl.RG, type);
      if (internalFormat === gl.RG16F) return getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, type);
      return null;
    }
    return { internalFormat, format };
  }
  function supportRTF(gl, internalFormat, format, type) {
    const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
    const fbo = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    return gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
  }

  let formatRGBA, formatRG, formatR;
  if (isWebGL2) {
    formatRGBA = getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, halfFloatTexType);
    formatRG   = getSupportedFormat(gl, gl.RG16F,   gl.RG,   halfFloatTexType);
    formatR    = getSupportedFormat(gl, gl.R16F,    gl.RED,  halfFloatTexType);
  } else {
    formatRGBA = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
    formatRG   = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
    formatR    = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
  }
  if (!formatRGBA || !formatRG || !formatR) return;
  if (!supportLinearFiltering) { config.DYE_RESOLUTION = 256; config.SHADING = false; }

  function hashCode(s) { let h=0; for(let i=0;i<s.length;i++){h=(h<<5)-h+s.charCodeAt(i);h|=0;} return h; }
  function addKeywords(src, kw) { if(!kw) return src; return kw.map(k=>'#define '+k+'\n').join('')+src; }
  function compileShader(type, src, kw) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, addKeywords(src, kw)); gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(sh));
    return sh;
  }
  function createProgram(vs, fs) {
    const p = gl.createProgram(); gl.attachShader(p,vs); gl.attachShader(p,fs); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) console.warn(gl.getProgramInfoLog(p));
    return p;
  }
  function getUniforms(p) {
    const u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i=0;i<n;i++) { const name=gl.getActiveUniform(p,i).name; u[name]=gl.getUniformLocation(p,name); }
    return u;
  }
  class GLProgram { constructor(vs,fs){this.program=createProgram(vs,fs);this.uniforms=getUniforms(this.program);} bind(){gl.useProgram(this.program);} }
  class Material {
    constructor(vs,fsrc){this.vs=vs;this.fsrc=fsrc;this.programs=[];this.active=null;this.uniforms=[];}
    setKeywords(kw){let h=0;kw.forEach(k=>h+=hashCode(k));let p=this.programs[h];if(!p){const fs=compileShader(gl.FRAGMENT_SHADER,this.fsrc,kw);p=createProgram(this.vs,fs);this.programs[h]=p;}if(p===this.active)return;this.uniforms=getUniforms(p);this.active=p;}
    bind(){gl.useProgram(this.active);}
  }

  const baseVS = compileShader(gl.VERTEX_SHADER, `precision highp float;attribute vec2 aPosition;varying vec2 vUv,vL,vR,vT,vB;uniform vec2 texelSize;void main(){vUv=aPosition*0.5+0.5;vL=vUv-vec2(texelSize.x,0);vR=vUv+vec2(texelSize.x,0);vT=vUv+vec2(0,texelSize.y);vB=vUv-vec2(0,texelSize.y);gl_Position=vec4(aPosition,0,1);}`);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,-1,1,1,1,1,-1]), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,2,0,2,3]), gl.STATIC_DRAW);
  gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0); gl.enableVertexAttribArray(0);

  const blit = (target, clear=false) => {
    if (!target){gl.viewport(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight);gl.bindFramebuffer(gl.FRAMEBUFFER,null);}
    else{gl.viewport(0,0,target.width,target.height);gl.bindFramebuffer(gl.FRAMEBUFFER,target.fbo);}
    if(clear){gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT);}
    gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0);
  };

  function createFBO(w,h,inFmt,fmt,type,param){
    gl.activeTexture(gl.TEXTURE0);const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,param);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,param);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D,0,inFmt,w,h,0,fmt,type,null);
    const fbo=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0);
    gl.viewport(0,0,w,h);gl.clear(gl.COLOR_BUFFER_BIT);
    return{tex,fbo,width:w,height:h,texelSizeX:1/w,texelSizeY:1/h,attach(id){gl.activeTexture(gl.TEXTURE0+id);gl.bindTexture(gl.TEXTURE_2D,tex);return id;}};
  }
  function createDoubleFBO(w,h,inFmt,fmt,type,param){
    let f1=createFBO(w,h,inFmt,fmt,type,param),f2=createFBO(w,h,inFmt,fmt,type,param);
    return{width:w,height:h,texelSizeX:f1.texelSizeX,texelSizeY:f1.texelSizeY,
      get read(){return f1;},set read(v){f1=v;},
      get write(){return f2;},set write(v){f2=v;},
      swap(){const t=f1;f1=f2;f2=t;}};
  }
  function resizeFBO(tgt,w,h,inFmt,fmt,type,param){
    const n=createFBO(w,h,inFmt,fmt,type,param);
    copyP.bind();gl.uniform1i(copyP.uniforms.uTexture,tgt.attach(0));blit(n);return n;
  }
  function resizeDoubleFBO(tgt,w,h,inFmt,fmt,type,param){
    if(tgt.width===w&&tgt.height===h)return tgt;
    tgt.read=resizeFBO(tgt.read,w,h,inFmt,fmt,type,param);
    tgt.write=createFBO(w,h,inFmt,fmt,type,param);
    tgt.width=w;tgt.height=h;tgt.texelSizeX=1/w;tgt.texelSizeY=1/h;return tgt;
  }
  function getResolution(res){let ar=gl.drawingBufferWidth/gl.drawingBufferHeight;if(ar<1)ar=1/ar;const min=Math.round(res),max=Math.round(res*ar);return gl.drawingBufferWidth>gl.drawingBufferHeight?{width:max,height:min}:{width:min,height:max};}
  function scaleByPixelRatio(i){return Math.floor(i*(window.devicePixelRatio||1));}

  const copyFS  = compileShader(gl.FRAGMENT_SHADER, `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;uniform sampler2D uTexture;void main(){gl_FragColor=texture2D(uTexture,vUv);}`);
  const clearFS = compileShader(gl.FRAGMENT_SHADER, `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;uniform sampler2D uTexture;uniform float value;void main(){gl_FragColor=value*texture2D(uTexture,vUv);}`);
  const splatFS = compileShader(gl.FRAGMENT_SHADER, `precision highp float;precision highp sampler2D;varying vec2 vUv;uniform sampler2D uTarget;uniform float aspectRatio;uniform vec3 color;uniform vec2 point;uniform float radius;void main(){vec2 p=vUv-point;p.x*=aspectRatio;vec3 s=exp(-dot(p,p)/radius)*color;vec3 b=texture2D(uTarget,vUv).xyz;gl_FragColor=vec4(b+s,1.0);}`);
  const advFS   = compileShader(gl.FRAGMENT_SHADER, `precision highp float;precision highp sampler2D;varying vec2 vUv;uniform sampler2D uVelocity,uSource;uniform vec2 texelSize,dyeTexelSize;uniform float dt,dissipation;vec4 bilerp(sampler2D s,vec2 uv,vec2 ts){vec2 st=uv/ts-0.5;vec2 iuv=floor(st);vec2 fuv=fract(st);vec4 a=texture2D(s,(iuv+vec2(0.5,0.5))*ts);vec4 b=texture2D(s,(iuv+vec2(1.5,0.5))*ts);vec4 c=texture2D(s,(iuv+vec2(0.5,1.5))*ts);vec4 d=texture2D(s,(iuv+vec2(1.5,1.5))*ts);return mix(mix(a,b,fuv.x),mix(c,d,fuv.x),fuv.y);}void main(){vec2 coord=vUv-dt*texture2D(uVelocity,vUv).xy*texelSize;vec4 res=texture2D(uSource,coord);float decay=1.0+dissipation*dt;gl_FragColor=res/decay;}`, supportLinearFiltering?null:['MANUAL_FILTERING']);
  const divFS   = compileShader(gl.FRAGMENT_SHADER, `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv,vL,vR,vT,vB;uniform sampler2D uVelocity;void main(){float L=texture2D(uVelocity,vL).x,R=texture2D(uVelocity,vR).x,T=texture2D(uVelocity,vT).y,B=texture2D(uVelocity,vB).y;vec2 C=texture2D(uVelocity,vUv).xy;if(vL.x<0.0)L=-C.x;if(vR.x>1.0)R=-C.x;if(vT.y>1.0)T=-C.y;if(vB.y<0.0)B=-C.y;gl_FragColor=vec4(0.5*(R-L+T-B),0,0,1);}`);
  const curlFS  = compileShader(gl.FRAGMENT_SHADER, `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv,vL,vR,vT,vB;uniform sampler2D uVelocity;void main(){float L=texture2D(uVelocity,vL).y,R=texture2D(uVelocity,vR).y,T=texture2D(uVelocity,vT).x,B=texture2D(uVelocity,vB).x;gl_FragColor=vec4(0.5*(R-L-T+B),0,0,1);}`);
  const vortFS  = compileShader(gl.FRAGMENT_SHADER, `precision highp float;precision highp sampler2D;varying vec2 vUv,vL,vR,vT,vB;uniform sampler2D uVelocity,uCurl;uniform float curl,dt;void main(){float L=texture2D(uCurl,vL).x,R=texture2D(uCurl,vR).x,T=texture2D(uCurl,vT).x,B=texture2D(uCurl,vB).x,C=texture2D(uCurl,vUv).x;vec2 f=0.5*vec2(abs(T)-abs(B),abs(R)-abs(L));f/=length(f)+0.0001;f*=curl*C;f.y*=-1.0;vec2 v=texture2D(uVelocity,vUv).xy+f*dt;v=min(max(v,-1000.0),1000.0);gl_FragColor=vec4(v,0,1);}`);
  const pressFS = compileShader(gl.FRAGMENT_SHADER, `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv,vL,vR,vT,vB;uniform sampler2D uPressure,uDivergence;void main(){float L=texture2D(uPressure,vL).x,R=texture2D(uPressure,vR).x,T=texture2D(uPressure,vT).x,B=texture2D(uPressure,vB).x,div=texture2D(uDivergence,vUv).x;gl_FragColor=vec4((L+R+B+T-div)*0.25,0,0,1);}`);
  const gradFS  = compileShader(gl.FRAGMENT_SHADER, `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv,vL,vR,vT,vB;uniform sampler2D uPressure,uVelocity;void main(){float L=texture2D(uPressure,vL).x,R=texture2D(uPressure,vR).x,T=texture2D(uPressure,vT).x,B=texture2D(uPressure,vB).x;vec2 v=texture2D(uVelocity,vUv).xy;v.xy-=vec2(R-L,T-B);gl_FragColor=vec4(v,0,1);}`);
  const dispSrc = `precision highp float;precision highp sampler2D;varying vec2 vUv,vL,vR,vT,vB;uniform sampler2D uTexture;uniform vec2 texelSize;void main(){vec3 c=texture2D(uTexture,vUv).rgb;\n#ifdef SHADING\nvec3 lc=texture2D(uTexture,vL).rgb,rc=texture2D(uTexture,vR).rgb,tc=texture2D(uTexture,vT).rgb,bc=texture2D(uTexture,vB).rgb;float dx=length(rc)-length(lc),dy=length(tc)-length(bc);vec3 n=normalize(vec3(dx,dy,length(texelSize)));float diff=clamp(dot(n,vec3(0,0,1))+0.7,0.7,1.0);c*=diff;\n#endif\nfloat a=max(c.r,max(c.g,c.b));gl_FragColor=vec4(c,a);}`;

  const copyP=new GLProgram(baseVS,copyFS), clearP=new GLProgram(baseVS,clearFS);
  const splatP=new GLProgram(baseVS,splatFS), advP=new GLProgram(baseVS,advFS);
  const divP=new GLProgram(baseVS,divFS), curlP=new GLProgram(baseVS,curlFS);
  const vortP=new GLProgram(baseVS,vortFS), pressP=new GLProgram(baseVS,pressFS);
  const gradP=new GLProgram(baseVS,gradFS);
  const dispM=new Material(baseVS,dispSrc);
  function updateKeywords(){let kw=[];if(config.SHADING)kw.push('SHADING');dispM.setKeywords(kw);}
  updateKeywords();

  let dye,velocity,divergence,curl,pressure;
  function initFBOs(){
    const sr=getResolution(config.SIM_RESOLUTION),dr=getResolution(config.DYE_RESOLUTION);
    const tt=halfFloatTexType,filter=supportLinearFiltering?gl.LINEAR:gl.NEAREST;
    gl.disable(gl.BLEND);
    if(!dye) dye=createDoubleFBO(dr.width,dr.height,formatRGBA.internalFormat,formatRGBA.format,tt,filter);
    else dye=resizeDoubleFBO(dye,dr.width,dr.height,formatRGBA.internalFormat,formatRGBA.format,tt,filter);
    if(!velocity) velocity=createDoubleFBO(sr.width,sr.height,formatRG.internalFormat,formatRG.format,tt,filter);
    else velocity=resizeDoubleFBO(velocity,sr.width,sr.height,formatRG.internalFormat,formatRG.format,tt,filter);
    divergence=createFBO(sr.width,sr.height,formatR.internalFormat,formatR.format,tt,gl.NEAREST);
    curl=createFBO(sr.width,sr.height,formatR.internalFormat,formatR.format,tt,gl.NEAREST);
    pressure=createDoubleFBO(sr.width,sr.height,formatR.internalFormat,formatR.format,tt,gl.NEAREST);
  }
  initFBOs();

  function HSVtoRGB(h,s,v){let r,g,b,i=Math.floor(h*6),f=h*6-i,p=v*(1-s),q=v*(1-f*s),t=v*(1-(1-f)*s);switch(i%6){case 0:r=v;g=t;b=p;break;case 1:r=q;g=v;b=p;break;case 2:r=p;g=v;b=t;break;case 3:r=p;g=q;b=v;break;case 4:r=t;g=p;b=v;break;case 5:r=v;g=p;b=q;break;}return{r,g,b};}
  function generateColor(){let c=HSVtoRGB(Math.random(),1,1);c.r*=0.15;c.g*=0.15;c.b*=0.15;return c;}
  function correctRadius(r){let ar=canvas.width/canvas.height;if(ar>1)r*=ar;return r;}
  function correctDX(d){let ar=canvas.width/canvas.height;if(ar<1)d*=ar;return d;}
  function correctDY(d){let ar=canvas.width/canvas.height;if(ar>1)d/=ar;return d;}

  function splat(x,y,dx,dy,color){
    splatP.bind();
    gl.uniform1i(splatP.uniforms.uTarget,velocity.read.attach(0));
    gl.uniform1f(splatP.uniforms.aspectRatio,canvas.width/canvas.height);
    gl.uniform2f(splatP.uniforms.point,x,y);
    gl.uniform3f(splatP.uniforms.color,dx,dy,0);
    gl.uniform1f(splatP.uniforms.radius,correctRadius(config.SPLAT_RADIUS/100));
    blit(velocity.write);velocity.swap();
    gl.uniform1i(splatP.uniforms.uTarget,dye.read.attach(0));
    gl.uniform3f(splatP.uniforms.color,color.r,color.g,color.b);
    blit(dye.write);dye.swap();
  }
  function splatPointer(p){splat(p.texcoordX,p.texcoordY,p.deltaX*config.SPLAT_FORCE,p.deltaY*config.SPLAT_FORCE,p.color);}
  function clickSplat(p){const c=generateColor();c.r*=10;c.g*=10;c.b*=10;splat(p.texcoordX,p.texcoordY,10*(Math.random()-0.5),30*(Math.random()-0.5),c);}

  let lastTime=Date.now(),colorTimer=0;
  function step(dt){
    gl.disable(gl.BLEND);
    curlP.bind();gl.uniform2f(curlP.uniforms.texelSize,velocity.texelSizeX,velocity.texelSizeY);gl.uniform1i(curlP.uniforms.uVelocity,velocity.read.attach(0));blit(curl);
    vortP.bind();gl.uniform2f(vortP.uniforms.texelSize,velocity.texelSizeX,velocity.texelSizeY);gl.uniform1i(vortP.uniforms.uVelocity,velocity.read.attach(0));gl.uniform1i(vortP.uniforms.uCurl,curl.attach(1));gl.uniform1f(vortP.uniforms.curl,config.CURL);gl.uniform1f(vortP.uniforms.dt,dt);blit(velocity.write);velocity.swap();
    divP.bind();gl.uniform2f(divP.uniforms.texelSize,velocity.texelSizeX,velocity.texelSizeY);gl.uniform1i(divP.uniforms.uVelocity,velocity.read.attach(0));blit(divergence);
    clearP.bind();gl.uniform1i(clearP.uniforms.uTexture,pressure.read.attach(0));gl.uniform1f(clearP.uniforms.value,config.PRESSURE);blit(pressure.write);pressure.swap();
    pressP.bind();gl.uniform2f(pressP.uniforms.texelSize,velocity.texelSizeX,velocity.texelSizeY);gl.uniform1i(pressP.uniforms.uDivergence,divergence.attach(0));
    for(let i=0;i<config.PRESSURE_ITERATIONS;i++){gl.uniform1i(pressP.uniforms.uPressure,pressure.read.attach(1));blit(pressure.write);pressure.swap();}
    gradP.bind();gl.uniform2f(gradP.uniforms.texelSize,velocity.texelSizeX,velocity.texelSizeY);gl.uniform1i(gradP.uniforms.uPressure,pressure.read.attach(0));gl.uniform1i(gradP.uniforms.uVelocity,velocity.read.attach(1));blit(velocity.write);velocity.swap();
    advP.bind();gl.uniform2f(advP.uniforms.texelSize,velocity.texelSizeX,velocity.texelSizeY);
    if(!supportLinearFiltering)gl.uniform2f(advP.uniforms.dyeTexelSize,velocity.texelSizeX,velocity.texelSizeY);
    const vid=velocity.read.attach(0);gl.uniform1i(advP.uniforms.uVelocity,vid);gl.uniform1i(advP.uniforms.uSource,vid);gl.uniform1f(advP.uniforms.dt,dt);gl.uniform1f(advP.uniforms.dissipation,config.VELOCITY_DISSIPATION);blit(velocity.write);velocity.swap();
    if(!supportLinearFiltering)gl.uniform2f(advP.uniforms.dyeTexelSize,dye.texelSizeX,dye.texelSizeY);
    gl.uniform1i(advP.uniforms.uVelocity,velocity.read.attach(0));gl.uniform1i(advP.uniforms.uSource,dye.read.attach(1));gl.uniform1f(advP.uniforms.dissipation,config.DENSITY_DISSIPATION);blit(dye.write);dye.swap();
  }
  function render(){gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.enable(gl.BLEND);dispM.bind();if(config.SHADING)gl.uniform2f(dispM.uniforms.texelSize,1/gl.drawingBufferWidth,1/gl.drawingBufferHeight);gl.uniform1i(dispM.uniforms.uTexture,dye.read.attach(0));blit(null);}

  function frame(){
    requestAnimationFrame(frame);
    let dt=Math.min((Date.now()-lastTime)/1000,0.016666);lastTime=Date.now();
    colorTimer+=dt*config.COLOR_UPDATE_SPEED;if(colorTimer>=1){colorTimer=0;pointers.forEach(p=>p.color=generateColor());}
    let w=scaleByPixelRatio(canvas.clientWidth),h=scaleByPixelRatio(canvas.clientHeight);
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;initFBOs();}
    pointers.forEach(p=>{if(p.moved){p.moved=false;splatPointer(p);}});
    step(dt);render();
  }
  frame();

  // ── Event handlers ──
  function handleMove(clientX, clientY) {
    dot.style.left = clientX + 'px';
    dot.style.top  = clientY + 'px';
    dot.style.opacity = '1';
    const p=pointers[0];
    const x=scaleByPixelRatio(clientX), y=scaleByPixelRatio(clientY);
    const tx=x/canvas.width, ty=1-y/canvas.height;
    if(p.texcoordX===0&&p.texcoordY===0){
      p.texcoordX=tx;p.texcoordY=ty;
      p.prevTexcoordX=tx;p.prevTexcoordY=ty;
      p.deltaX=0;p.deltaY=0;p.color=generateColor();return;
    }
    p.prevTexcoordX=p.texcoordX;p.prevTexcoordY=p.texcoordY;
    p.texcoordX=tx;p.texcoordY=ty;
    p.deltaX=correctDX(tx-p.prevTexcoordX);p.deltaY=correctDY(ty-p.prevTexcoordY);
    p.moved=Math.abs(p.deltaX)>0||Math.abs(p.deltaY)>0;
  }

  function handleClick(clientX, clientY) {
    const p=pointers[0];
    const x=scaleByPixelRatio(clientX), y=scaleByPixelRatio(clientY);
    p.texcoordX=x/canvas.width;p.texcoordY=1-y/canvas.height;
    p.color=generateColor();clickSplat(p);
  }

  window.addEventListener('mousemove', e => handleMove(e.clientX, e.clientY));
  window.addEventListener('mousedown', e => {
    handleClick(e.clientX, e.clientY);
    dot.style.width  = '3px';
    dot.style.height = '3px';
  });
  window.addEventListener('mouseup', () => {
    dot.style.width  = '5px';
    dot.style.height = '5px';
  });
  window.addEventListener('mouseleave', () => { dot.style.opacity = '0'; });
  window.addEventListener('mouseenter', () => { dot.style.opacity = '1'; });

  // Terima posisi cursor dari iframe via cursor-bridge
  window.addEventListener('message', e => {
    if (!e.data || !e.data._bridge) return;
    if (e.data.type === 'iframe-mousemove') handleMove(e.data.x, e.data.y);
    if (e.data.type === 'iframe-click')     handleClick(e.data.x, e.data.y);
  });
})();
