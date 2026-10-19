// Regression checks for unsafe reply rendering, cancelled requests and missing audio.
// Uses Node built-ins and a small event target; no real messages are sent.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
class Element {
  constructor() { this.children=[]; this.events={}; this.attributes={}; this.value=''; this.disabled=false; }
  set innerHTML(value) { throw new Error('Untrusted HTML must never be interpreted'); }
  setAttribute(name,value) { this.attributes[name]=value; }
  addEventListener(event,callback) { this.events[event]=callback; }
  append(...items) { this.children.push(...items); }
  replaceChildren(...items) { this.children=items; }
  focus() { this.focused=true; }
  querySelector() { return this.button; }
  querySelectorAll() { return this.children; }
  pause() {}
  load() {}
  async play() {}
}
const flush=()=>new Promise(resolve=>setImmediate(resolve));
function environment(ids,fetch) {
  const nodes=Object.fromEntries(ids.map(id=>[id,new Element()]));
  const context=vm.createContext({
    document:{getElementById:id=>nodes[id],createElement:()=>new Element(),createTextNode:text=>({textContent:text})},
    fetch,AbortController,setTimeout,clearTimeout,console
  });
  return {nodes,context};
}
(async()=>{
  let reply='<img src=x onerror=alert(1)>', fail=false, resolver;
  const agent=environment(['chatForm','message','chat','chatStatus','clearChat'],async()=>{
    if(fail)throw new Error('offline');
    if(resolver===true)return new Promise(resolve=>{resolver=resolve});
    return {ok:true,json:async()=>({reply})};
  });
  agent.nodes.chatForm.button=new Element();
  vm.runInContext(fs.readFileSync(path.join(root,'agent.js'),'utf8'),agent.context);
  const send=async(text)=>{agent.nodes.message.value=text;return agent.nodes.chatForm.events.submit({preventDefault(){}})};
  await send('Hola');
  assert.equal(agent.nodes.chat.children[1].children[1].textContent,reply);
  assert.equal(agent.nodes.chatForm.button.disabled,false);
  fail=true; await send('Prueba de error');
  assert.match(agent.nodes.chatStatus.textContent,/no ha respondido/);
  assert.equal(agent.nodes.chatForm.button.disabled,false);
  fail=false; resolver=true;
  const pending=send('Petición cancelada'); await flush();
  agent.nodes.clearChat.events.click();
  resolver({ok:true,json:async()=>({reply:'respuesta tardía'})}); await pending;
  assert.equal(agent.nodes.chat.children.length,0);
  assert.match(agent.nodes.chatStatus.textContent,/borrada/);

  const player=environment(['icaroAudio','trackList','audioNow','audioNote'],async()=>({ok:false}));
  vm.runInContext(fs.readFileSync(path.join(root,'player.js'),'utf8'),player.context);
  await flush();
  const {icaroAudio:audio,trackList:list,audioNote:note}=player.nodes;
  assert.equal(list.children.length,9);
  list.children[0].events.click();
  assert.equal(audio.src,'mp3/01%20Ni%20mirarte.mp3');
  assert.equal(list.children[0].attributes['aria-pressed'],'true');
  audio.events.error(); assert.equal(audio.src,'lista/01%20Ni%20mirarte.mp3');
  audio.events.error(); assert.match(note.textContent,/no está disponible/);
  assert.doesNotMatch(note.textContent,/Escuchando/);
  audio.events.playing(); assert.match(note.textContent,/Escuchando Ni mirarte/);
  audio.events.ended(); assert.equal(audio.src,'mp3/02%20Perpetua.mp3');
  list.children[8].events.click(); audio.events.ended();
  assert.match(note.textContent,/final de Ícaro/);
  console.log('PASS: reply stays plain text; network error recovers; clear ignores late replies; nine tracks, fallback paths, honest unavailable state and next-track behavior.');
})().catch(error=>{console.error(error);process.exitCode=1});
