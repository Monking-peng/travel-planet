import * as THREE from 'three';
import {palette,site,paving,steps,grove,sign,finish,hall,lit,TAU,skin,lantern,dragon,hip,sea,railing} from './quanzhou-kit.js';
import {bridge} from './shunde-kit.js';
export {kaiyuan} from './quanzhou-kaiyuan.js';
export {tianhou} from './quanzhou-tianhou.js';
export function wenmiao(k){
 const g=new THREE.Group(),p=palette(k),h=site(k,g,.63,.56);paving(k,g,p,.51,.45);p.tile=k.mat('#787657',.9);
 hall(k,g,p,{z:-.20,w:.57,d:.26,h:.17,double:true,ornate:true});sign(k,g,'大成殿',.077,.034,0,.235,-.034,{background:'#4a392b',color:'#ddc69c'});
 for(const x of [-.40,.40]){const c=new THREE.Group();c.position.x=x;c.rotation.y=Math.PI/2;g.add(c);hall(k,c,p,{w:.43,d:.13,h:.09});}
 sea(k,g,p,.29,.19,0,.17);for(const z of [-.02,.36])k.box(g,.61,.011,.020,p.stone,0,.031,z);for(const x of [-.30,.30])k.box(g,.020,.011,.38,p.stone,x,.031,.17);
 const b=new THREE.Group();b.rotation.y=Math.PI/2;b.position.z=.17;g.add(b);bridge(k,b,p,{length:.42,w:.085,rise:.043,y:.025});
 for(const side of [-1,1]){const a=side*.27;railing(k,g,p,[[a,.032,-.03],[a,.032,.37]],.031);}
 steps(k,g,p,0,.01,.32,4,.025,.065);const burner=k.cyl(g,.022,.028,.035,p.wood,0,.075,-.015,20);for(const side of [-1,1])k.beam(g,[side*.022,.074,-.015],[side*.028,.115,-.015],.003,p.wood);
 grove(k,g,h,[[-.39,.29,.20],[.39,.29,.20],[-.48,-.27,.14],[.48,-.27,.14]]);
 return finish(k,g,{lamps:[[-.20,.023,.40],[.20,.023,.40],[-.28,.023,-.06],[.28,.023,-.06]],visitors:[[-.08,.023,.40],[.07,.023,.37],[-.24,.023,-.06]]});
}
export {luojia} from './quanzhou-luojia.js';
