import * as THREE from 'three';
import {palette,site,paving,steps,grove,sign,finish,hall,lit,TAU,skin,lantern,dragon,hip,sea,railing} from './quanzhou-kit.js';
import {bridge} from './shunde-kit.js';
export {kaiyuan} from './quanzhou-kaiyuan.js';
export function tianhou(k){
 const g=new THREE.Group(),p=palette(k),h=site(k,g,.62,.55);paving(k,g,p,.49,.43);p.tile=k.mat('#79755c',.91);
 hall(k,g,p,{z:.23,w:.55,d:.18,h:.17,ornate:true});hall(k,g,p,{z:-.18,w:.45,d:.25,h:.18,double:true,ornate:true});
 for(const x of [-.36,.36]){const wing=new THREE.Group();g.add(wing);wing.position.set(x,0,-.02);wing.rotation.y=Math.PI/2;hall(k,wing,p,{w:.42,d:.13,h:.10});}
 for(const x of [-.20,-.068,.068,.20])lantern(k,g,p,x,.185,.325,.015);
 // Stone dragon columns and the two guardian lions belong to the entrance.
 for(const x of [-.18,.18]){k.box(g,.048,.037,.048,p.stone,x,.040,.38);const body=k.ball(g,.019,p.stone,x,.072,.38);body.scale.set(.8,1.1,1.0);k.ball(g,.014,p.pale,x,.094,.393);for(const dx of [-.009,.009])k.box(g,.010,.025,.022,p.stone,x+dx,.060,.397);}
 sign(k,g,'天后宫',.076,.033,0,.190,.324,{background:'#483c32',color:'#d6bc83'});steps(k,g,p,0,.41,.25,4,.026,.07);
 grove(k,g,h,[[-.49,-.29,.16],[.49,-.30,.16],[-.18,-.43,.13],[.20,-.43,.13]]);
 return finish(k,g,{lamps:[[-.29,.023,.40],[.29,.023,.40],[-.22,.023,.01],[.22,.023,.01]],visitors:[[-.08,.023,.40],[.09,.023,.41],[.12,.023,.05],[-.16,.023,-.04]]});
}
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
