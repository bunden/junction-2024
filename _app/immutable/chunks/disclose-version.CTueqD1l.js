import{ac as W,Y as F,ad as L,a5 as S,v as G,H as z,ae as H,E,af as A,ag as w,ah as K,ai as x,M as v,V as l,R as k,N as $,aj as I,ak as J,al as Q,am as M,T as N,an as X,ao as Z,ap as ee,aq as re,ar as te,as as ne,K as ae,p as se,j as oe,c as ie,w as ue,n as P,s as fe,g as le,o as ce}from"./utils.DrkPLmdC.js";const j=new Set,O=new Set;function de(e,r,t,s){function a(n){if(s.capture||m.call(r,n),!n.cancelBubble){var o=H,c=E;L(null),S(null);try{return t.call(this,n)}finally{L(o),S(c)}}}return e.startsWith("pointer")||e.startsWith("touch")||e==="wheel"?F(()=>{r.addEventListener(e,a,s)}):r.addEventListener(e,a,s),a}function be(e,r,t,s,a){var n={capture:s,passive:a},o=de(e,r,t,n);(r===document.body||r===window||r===document)&&W(()=>{r.removeEventListener(e,o,n)})}function we(e){for(var r=0;r<e.length;r++)j.add(e[r]);for(var t of O)t(e)}function m(e){var C;var r=this,t=r.ownerDocument,s=e.type,a=((C=e.composedPath)==null?void 0:C.call(e))||[],n=a[0]||e.target,o=0,c=e.__root;if(c){var f=a.indexOf(c);if(f!==-1&&(r===document||r===window)){e.__root=r;return}var h=a.indexOf(r);if(h===-1)return;f<=h&&(o=f)}if(n=a[o]||e.target,n!==r){G(e,"currentTarget",{configurable:!0,get(){return n||t}});var R=H,d=E;L(null),S(null);try{for(var i,u=[];n!==null;){var p=n.assignedSlot||n.parentNode||n.host||null;try{var g=n["__"+s];if(g!==void 0&&!n.disabled)if(z(g)){var[Y,...U]=g;Y.apply(n,[e,...U])}else g.call(n,e)}catch(T){i?u.push(T):i=T}if(e.cancelBubble||p===r||p===null)break;n=p}if(i){for(let T of u)queueMicrotask(()=>{throw T});throw i}}finally{e.__root=r,delete e.currentTarget,L(R),S(d)}}}function q(e){var r=document.createElement("template");return r.innerHTML=e,r.content}function _(e,r){var t=E;t.nodes_start===null&&(t.nodes_start=e,t.nodes_end=r)}function Ee(e,r){var t=(r&K)!==0,s=(r&x)!==0,a,n=!e.startsWith("<!>");return()=>{if(v)return _(l,null),l;a===void 0&&(a=q(n?e:"<!>"+e),t||(a=w(a)));var o=s?document.importNode(a,!0):a.cloneNode(!0);if(t){var c=w(o),f=o.lastChild;_(c,f)}else _(o,o);return o}}function Te(e,r,t="svg"){var s=!e.startsWith("<!>"),a=`<${t}>${s?e:"<!>"+e}</${t}>`,n;return()=>{if(v)return _(l,null),l;if(!n){var o=q(a),c=w(o);n=w(c)}var f=n.cloneNode(!0);return _(f,f),f}}function Ne(e=""){if(!v){var r=A(e+"");return _(r,r),r}var t=l;return t.nodeType!==3&&(t.before(t=A()),k(t)),_(t,t),t}function Le(){if(v)return _(l,null),l;var e=document.createDocumentFragment(),r=document.createComment(""),t=A();return e.append(r,t),_(r,t),e}function Se(e,r){if(v){E.nodes_end=l,$();return}e!==null&&e.before(r)}function Ae(e){return e.endsWith("capture")&&e!=="gotpointercapture"&&e!=="lostpointercapture"}const _e=["beforeinput","click","change","dblclick","contextmenu","focusin","focusout","input","keydown","keyup","mousedown","mousemove","mouseout","mouseover","mouseup","pointerdown","pointermove","pointerout","pointerover","pointerup","touchend","touchmove","touchstart"];function Re(e){return _e.includes(e)}const pe={formnovalidate:"formNoValidate",ismap:"isMap",nomodule:"noModule",playsinline:"playsInline",readonly:"readOnly"};function Me(e){return e=e.toLowerCase(),pe[e]??e}const ve=["touchstart","touchmove"];function he(e){return ve.includes(e)}let D=!0;function ke(e){D=e}function Ie(e,r){var t=r==null?"":typeof r=="object"?r+"":r;t!==(e.__t??(e.__t=e.nodeValue))&&(e.__t=t,e.nodeValue=t==null?"":t+"")}function ge(e,r){return B(e,r)}function Oe(e,r){I(),r.intro=r.intro??!1;const t=r.target,s=v,a=l;try{for(var n=w(t);n&&(n.nodeType!==8||n.data!==J);)n=Q(n);if(!n)throw M;N(!0),k(n),$();const o=B(e,{...r,anchor:n});if(l===null||l.nodeType!==8||l.data!==X)throw Z(),M;return N(!1),o}catch(o){if(o===M)return r.recover===!1&&ee(),I(),re(t),N(!1),ge(e,r);throw o}finally{N(s),k(a)}}const y=new Map;function B(e,{target:r,anchor:t,props:s={},events:a,context:n,intro:o=!0}){I();var c=new Set,f=d=>{for(var i=0;i<d.length;i++){var u=d[i];if(!c.has(u)){c.add(u);var p=he(u);r.addEventListener(u,m,{passive:p});var g=y.get(u);g===void 0?(document.addEventListener(u,m,{passive:p}),y.set(u,1)):y.set(u,g+1)}}};f(te(j)),O.add(f);var h=void 0,R=ne(()=>{var d=t??r.appendChild(A());return ae(()=>{if(n){se({});var i=ie;i.c=n}a&&(s.$$events=a),v&&_(d,null),D=o,h=e(d,s)||{},D=!0,v&&(E.nodes_end=l),n&&oe()}),()=>{var p;for(var i of c){r.removeEventListener(i,m);var u=y.get(i);--u===0?(document.removeEventListener(i,m),y.delete(i)):y.set(i,u)}O.delete(f),V.delete(h),d!==t&&((p=d.parentNode)==null||p.removeChild(d))}});return V.set(h,R),h}let V=new WeakMap;function De(e){const r=V.get(e);r&&r()}let b=!1;function Ve(e,r,t){const s=t[r]??(t[r]={store:null,source:ue(void 0),unsubscribe:P});if(s.store!==e)if(s.unsubscribe(),s.store=e??null,e==null)s.source.v=void 0,s.unsubscribe=P;else{var a=!0;s.unsubscribe=fe(e,n=>{a?s.source.v=n:ce(s.source,n)}),a=!1}return le(s.source)}function Ce(e,r){return e.set(r),r}function Pe(){const e={};return W(()=>{for(var r in e)e[r].unsubscribe()}),e}function We(){b=!0}function He(e){var r=b;try{return b=!1,[e(),b]}finally{b=r}}const ye="5";typeof window<"u"&&(window.__svelte||(window.__svelte={v:new Set})).v.add(ye);export{Se as a,Ie as b,Ve as c,Le as d,Ne as e,He as f,_ as g,Oe as h,ke as i,Ae as j,de as k,we as l,ge as m,Me as n,Re as o,D as p,be as q,Ce as r,Pe as s,Ee as t,De as u,We as v,Te as w};
