const emojis = ["🔥","⚡","🧿","💠","🌀"];

/* ---------------- LOGIN ---------------- */
async function login(){
    const password = document.getElementById("pass").value;

    const res = await fetch(API_URL + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
    });

    const data = await res.json();

    if(!data.success){
        document.getElementById("out").innerText = "ACCESS DENIED ❌";
        return;
    }

    SESSION_TOKEN = data.token;

    document.getElementById("out").innerText = "ACCESS GRANTED ✔";
    document.getElementById("app").classList.remove("hidden");
    document.getElementById("loginBox").classList.add("hidden");
}

/* ---------------- VERIFY SESSION ---------------- */
async function verify(){
    if(!SESSION_TOKEN) return false;

    const res = await fetch(API_URL + "/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: SESSION_TOKEN })
    });

    const data = await res.json();
    return data.success;
}

/* ---------------- SAFE BASE64 ---------------- */
function toBase64(str){
    const bytes = new TextEncoder().encode(str);
    let bin = "";
    bytes.forEach(b => bin += String.fromCharCode(b));
    return btoa(bin);
}

function fromBase64(str){
    const bin = atob(str);
    const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
}

/* ---------------- LAYERS ---------------- */

const UNI = s => s.normalize("NFKC");

function shift(str, enc=true){
    const key = 7;
    return [...str].map((c,i)=>{
        let code = c.codePointAt(0);
        let k = (key + i) % 7;
        return String.fromCodePoint(enc ? code + k : code - k);
    }).join("");
}

function swap(str){
    let a = str.split("");
    for(let i=0;i<a.length-1;i+=2){
        [a[i], a[i+1]] = [a[i+1], a[i]];
    }
    return a.join("");
}

function noise(str){
    let out = "";
    for(let i=0;i<str.length;i++){
        out += str[i];
        if(i % 4 === 0) out += emojis[i % emojis.length];
    }
    return out;
}

function denoise(str){
    return str.replace(/[\u{1F300}-\u{1FAFF}]/gu,"");
}

function hex(str){
    return [...str].map(c => c.codePointAt(0).toString(16)).join("-");
}

function dehex(str){
    return str.split("-")
        .map(x => String.fromCodePoint(parseInt(x,16)))
        .join("");
}

/* ---------------- ENCODE ---------------- */
async function encode(){
    if(!(await verify())) return;

    let t = document.getElementById("input").value;

    let r = UNI(t);
    r = toBase64(r);
    r = shift(r,true);
    r = swap(r);
    r = noise(r);
    r = hex(r);

    document.getElementById("out").innerText = r;
}

/* ---------------- DECODE ---------------- */
async function decode(){
    if(!(await verify())) return;

    let t = document.getElementById("input").value;

    let r = dehex(t);
    r = denoise(r);
    r = swap(r);
    r = shift(r,false);
    r = fromBase64(r);
    r = UNI(r);

    document.getElementById("out").innerText = r;
}

/* ---------------- COPY ---------------- */
function copyOut(){
    navigator.clipboard.writeText(
        document.getElementById("out").innerText
    );
}
