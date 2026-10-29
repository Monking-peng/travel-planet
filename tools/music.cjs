const fs=require('node:fs'),path=require('node:path');
// Original composition. No recorded samples or third-party melody.
const sr=32000,bpm=76,beat=60/bpm,bars=16,duration=bars*4*beat,N=Math.ceil(duration*sr);
const left=new Float32Array(N),right=new Float32Array(N);
const freq=m=>440*Math.pow(2,(m-69)/12);
function note(m,start,length,volume,pan=0,pad=false){const f=freq(m),offset=Math.floor(start*sr),count=Math.min(Math.floor(length*sr),N-offset);for(let j=0;j<count;j++){const t=j/sr;let env;if(pad)env=Math.min(t/.65,1)*Math.min((length-t)/.9,1)*.22;else env=(1-Math.exp(-t*50))*Math.exp(-t*1.5)*Math.min(1,(length-t)/.15);const tone=pad?(Math.sin(2*Math.PI*f*t)+.22*Math.sin(2*Math.PI*f*2.003*t)):(Math.sin(2*Math.PI*f*t)+.28*Math.sin(2*Math.PI*f*2*t)*Math.exp(-t*3)+.075*Math.sin(2*Math.PI*f*3*t));const val=tone*env*volume;left[offset+j]+=val*(1-pan*.35);right[offset+j]+=val*(1+pan*.35);}}
const chords=[[50,57,62,65],[46,53,58,62],[48,55,60,64],[45,52,57,60]];
const melody=[[74,0],[77,1.5],[76,3],[72,0.5],[69,2.5],[74,0],[72,2],[69,3],[67,1],[69,2.5],[72,.5],[74,2],[77,1],[76,3],[74,0],[69,2]];
for(let bar=0;bar<bars;bar++){
  const start=bar*4*beat,chord=chords[Math.floor(bar/2)%4];
  chord.forEach((m,i)=>note(m,start,4*beat+.7,.055,(i-1.5)/2,true));
  [0,1.5,3].forEach((t,i)=>note(chord[i%4]+12,start+t*beat,2.3,.045,i%2?.5:-.5));
  const [m,t]=melody[bar];note(m,start+t*beat,2.7,.11,bar%2?.3:-.3);
}
// Short stereo reflections soften the mallet sound without a bright or intrusive beat.
for(let i=N-1;i>=0;i--){const delay=Math.floor(.19*sr);if(i>=delay){left[i]+=right[i-delay]*.12;right[i]+=left[i-delay]*.1;}}
let peak=0,sum=0;for(let i=0;i<N;i++){const fade=Math.min(1,i/sr/1.4,(N-1-i)/sr/2);left[i]*=fade;right[i]*=fade;peak=Math.max(peak,Math.abs(left[i]),Math.abs(right[i]));sum+=left[i]*left[i]+right[i]*right[i];}
const wav=Buffer.alloc(44+N*4);wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVE',8);wav.write('fmt ',12);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(2,22);wav.writeUInt32LE(sr,24);wav.writeUInt32LE(sr*4,28);wav.writeUInt16LE(4,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(N*4,40);
for(let i=0;i<N;i++){wav.writeInt16LE(Math.round(Math.max(-1,Math.min(1,left[i]))*32767),44+i*4);wav.writeInt16LE(Math.round(Math.max(-1,Math.min(1,right[i]))*32767),46+i*4);}
const file=path.resolve(__dirname,'../.local/lakeside.wav');fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,wav);console.log(JSON.stringify({duration,peak,rms:Math.sqrt(sum/N/2),file}));
