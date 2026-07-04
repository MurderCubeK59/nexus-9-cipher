const emojis = ["🔥","⚡","🧿","💠","🌀"];

/* ---------------- LOGIN ---------------- */
async function login(){
    const pass = document.getElementById("pass").value;

    const res = await fetch(API_URL + "/login", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ pass })
    });

    const data = await res.json();

    if(!data.ok){
        document.getElementById("status").innerText = "ACCESS DENIED";
        return;
    }

    SESSION_TOKEN = data.token;

    document.getElementById("loginBox").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
}

/* ---------------- VERIFY ---------------- */
async function verify(){
    if(!SESSION_TOKEN) return false;

    const res = await fetch(API_URL + "/verify", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ token: SESSION_TOKEN })
    });

    const data = await res.json();
    return data.ok;
}

/* ---------------- LAYERS ---------------- */

const UNI = s => s.normalize("NFKC");

function utf8Encode(str){
    return btoa(unescape(encodeURIComponent(str)));
}
function utf8Decode(str){
    return decodeURIComponent(escape(atob(str)));
}

/* session-based seed shift */
function shift(str, seed, enc=true){
    return [...str].map((c,i)=>{
        let code = c.codePointAt(0);
        let s = (seed + i) % 7;
        return String.fromCodePoint(enc ? code + s : code - s);
    }).join("");
}

/* block shuffle */
function blockSwap(str){
    let a = str.split("");

    let pairs = [];

    for(let i=0;i<a.length-1;i+=2){
        pairs.push([a[i], a[i+1]]);
    }

    let swapped = pairs.map(p=>[p[1],p[0]]).flat();

    if(a.length % 2 !== 0){
        swapped.push(a[a.length-1]);
    }

    return swapped.join("");
}

/* emoji noise */
function noise(str){
    let out="";
    for(let i=0;i<str.length;i++){
        out+=str[i];
        if(i%4===0) out+=emojis[i%emojis.length];
    }
    return out;
}
function deNoise(str){
    return str.replace(/[\u{1F300}-\u{1FAFF}]/gu,"");
}

/* hex final */
function hex(str){
    return [...str].map(c=>c.codePointAt(0).toString(16)).join("-");
}
function dehex(str){
    return str.split("-").map(x=>String.fromCodePoint(parseInt(x,16))).join("");
}

/* ---------------- ENCODE ---------------- */
async function encode(){
    if(!await verify()) return;

    let seed = SESSION_TOKEN.length;

    let t = document.getElementById("input").value;

    let r = UNI(t);
    r = utf8Encode(r);
    r = shift(r,seed,true);
    r = blockSwap(r);
    r = noise(r);
    r = hex(r);

    document.getElementById("out").innerText = r;
}

/* ---------------- DECODE ---------------- */
async function decode(){
    if(!await verify()) return;

    let seed = SESSION_TOKEN.length;

    let t = document.getElementById("input").value;

    let r = dehex(t);
    r = deNoise(r);
    r = blockSwap(r);
    r = shift(r,seed,false);
    r = utf8Decode(r);
    r = UNI(r);

    document.getElementById("out").innerText = r;
}

/* ---------------- COPY ---------------- */
function copyOut(){
    navigator.clipboard.writeText(
        document.getElementById("out").innerText
    );
}
