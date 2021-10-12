import F from"https://cdn.skypack.dev/@jacobmarshall/kv";var m=t=>t.split(/\/|#|\:/).pop(),A=(t,e)=>{var o;return(o=t.find(n=>n.lang===e))!=null?o:t[0]},d=(t,e,o={},n=[])=>{if(typeof t!="object")return t;let c=s=>{if(s.toString().includes(":")){let r=s.toString().split(":");(e==null?void 0:e[r[0]])&&(s=s.toString().replace(r[0]+":",e[r[0]]))}return s};return new Proxy(t,{get(s,r,i){var f,p;if(r==="_proxyType")return"JsonLdProxy";if(r=c(r),r==="$"&&!("$"in o))return s;if(r==="_alias")return n;if(r==="_"&&!("_"in o)){let u=a=>{var h,y;return Array.isArray(a)?u(A(a,"en")):(y=(h=a==null?void 0:a.id)!=null?h:a==null?void 0:a.value)!=null?y:a};return d(u(s),e,o,n)}if(r==="isProxy")return!0;for(let[u,a]of Object.entries(o))if(r===u)return a(s);if(r[0]==="*"){let u=r.toString().substr(1);for(let a of Object.keys(s))m(a)===u&&(r=a)}let l=!Reflect.has({},r)&&!Reflect.has([],r)&&Reflect.has(s,r);if(n.length&&!r.toString().includes(":")&&!Reflect.has({},r)&&!Reflect.has([],r))for(let u of n){let a=c(u+":"+r.toString());if(!Reflect.has({},a)&&!Reflect.has([],a)&&Reflect.has(s,a)&&Reflect.has(s,a)&&s[a])return d(s[a],e,o,n)}if(((p=(f=s[r])==null?void 0:f[0])==null?void 0:p["@list"])&&l)return d(s[r][0]["@list"],e,o,n);if(l&&s[r])return d(s[r],e,o,n);if(["filter"].includes(r.toString())){let u=Reflect.get(s,r,i);return(...a)=>u.apply(s.map(h=>d(h,e,o,n)),a)}return Reflect.get(s,r,i)},set(s,r,i){return r=c(r),s[r]=i,!0}})};var P={dbo:"http://dbpedia.org/ontology/",dbp:"http://dbpedia.org/property/",dbr:"http://dbpedia.org/resource/",foaf:"http://xmlns.com/foaf/0.1/",rdfs:"http://www.w3.org/2000/01/rdf-schema#",rdf:"http://www.w3.org/1999/02/22-rdf-syntax-ns#"};var R=F("cache"),b=async t=>{var c,s;if(!t)throw new Error("We need an identifier");let e=await R.get(t);if(!e){try{let i=`DESCRIBE <${`http://dbpedia.org/resource/${t}`}>`;e=await(await fetch(`https://dbpedia.org/sparql?default-graph-uri=http://dbpedia.org&query=${i}&format=application/json-ld`)).json()}catch(r){e=!1}return await R.set(t,e),null}let n=d(e,P,{},["rdfs","dbp","foaf"])[`dbr:${t}`];if((c=n==null?void 0:n["dbo:wikiPageRedirects"])==null?void 0:c._){let r=(s=n==null?void 0:n["dbo:wikiPageRedirects"])==null?void 0:s._;return b(m(r))}return n?(n._identifier=t,n):null};var k=async(t,e=null)=>{let o=t.map(s=>m(s._)).filter(Boolean);o=o.flatMap(s=>s.replaceAll(" ","_").split(",_"));let c=(await Promise.all(o.map(b))).filter(s=>{var r;return(r=s==null?void 0:s["rdf:type"])==null?void 0:r.some(i=>i._==="http://xmlns.com/foaf/0.1/Person")});return e?c.sort((s,r)=>{let i=p=>{var a;let u="";for(let h of e)if(u=(a=p[h])==null?void 0:a._.toString(),u)return u;return""},l=i(s),f=i(r);return l.localeCompare(f)}):c};import{html as g,render as G}from"https://cdn.skypack.dev/uhtml/async";function j(t,e,o=!1){var n;return function(){var c=this,s=arguments,r=function(){n=null,o||t.apply(c,s)},i=o&&!n;clearTimeout(n),n=setTimeout(r,e),i&&t.apply(c,s)}}function I(t){for(var e=0,o=0;o<t.length;o++)e=t.charCodeAt(o)+((e<<5)-e);return e}function O(t){var e=(t&16777215).toString(16).toUpperCase();return"00000".substring(0,6-e.length)+e}var _=t=>O(I(t));import{html as S,render as C}from"https://cdn.skypack.dev/uhtml/async";import J from"https://cdn.skypack.dev/@jacobmarshall/kv";var v=t=>`https://images.weserv.nl/?url=${encodeURI(t)}&w=100&h=100&fit=cover&a=attention`;var T=J("thumbnailAlternative"),E=async(t,e)=>{var r,i;let o=e==null?void 0:e.replace(/[^A-Z]/g,"").split("").map(l=>l.substr(0,1)),n=t!=null?t:await T.get(e),c=()=>S`<div class="image-alternative" style=${`--color: #${_(e)}`}>
            <span>${o.join("")}</span>
        </div>`;if(n===void 0){let l=`https://en.wikipedia.org/w/api.php?action=query&origin=*&titles=${e}&prop=pageimages&format=json&pithumbsize=400`,p=await(await fetch(l,{method:"GET"})).json(),[u]=Object.keys(p.query.pages);n=(i=(r=p.query.pages[u].thumbnail)==null?void 0:r.source)!=null?i:!1,await T.set(e,n)}let s=l=>{let f=document.createElement("div");C(f,c()),l.target.replaceWith(f)};return n===!1?c():S`<img onerror=${[s,{once:!0}]} class="image" src=${v(n)} />`};document.body.addEventListener("click",t=>{let e=t.target.nodeName!=="A"?t.target.closest("a"):t.target;if(e){let o=e.getAttribute("href");o&&o[0]==="/"&&(t.preventDefault(),setTimeout(()=>{history.pushState(null,null,o),$()}))}});var D=(t,e)=>{let o=location.pathname.substr(1).split(",");return o.splice(e),`/${o.join(",")}`},M=(t,e)=>{let o=location.pathname.substr(1).split(",");return e<0?o=[t]:(o.splice(e),o[e]=t),`/${o.join(",")}`},U=(t,e=0,o)=>{var c,s,r;if(!t)return null;let n=q(t._identifier,o);return g`
        <a 
            href=${n?D(t._identifier,o):M(t._identifier,o)} 
            class=${`person ${n?"active":""}`} 
            style=${`--index: ${e}`}
            data-id=${t._identifier}>
        
                ${E((c=t.depiction)==null?void 0:c._,(s=t.label)==null?void 0:s._)}

                <h3 class="name">${(r=t.label)==null?void 0:r._}</h3>
        
        </a>
    `},q=(t,e)=>decodeURI(location.pathname).substr(1).split(",")[e]===t,X=t=>{let e=t.target.querySelector(".inner");e.style=`--scroll: ${t.target.scrollTop}px; --half: ${t.target.clientHeight/2}px`},B=t=>{x.push(t)},x=[],w=[],$=async()=>{let t=decodeURI(location.pathname).substr(1).trim().split(",").filter(Boolean),e=await Promise.all(t.map(b)),o=["dbo:birthDate","dbo:birthYear","dbo:activeYearsStartYear"],n=async(i,l,f)=>{var a;let p=((a=i==null?void 0:i[l])==null?void 0:a.length)?await k(i[l],o):[],u=p.some(h=>q(h._identifier,f));return g`
        <div onscroll=${X} style=${`--count: ${p.length}`} class=${`${l} column ${u?"active":""}`}>
            <div ref=${B} class="inner">
                ${p.map((h,y)=>U(h,y,f))}
                <div class="scroll-maker"></div>
            </div>
        </div>
        `},c=async i=>{if(i.target.value.length<4)return;let l=`
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX dbo:  <http://dbpedia.org/ontology/>
            PREFIX bif: <bif:>
            PREFIX foaf: <http://xmlns.com/foaf/0.1/>
        
            SELECT DISTINCT ?uri ?label ?image {
        
            ?uri rdfs:label ?label .
            ?uri a <http://xmlns.com/foaf/0.1/Person> .
            ?uri dbo:thumbnail ?image .
            ?label bif:contains '"${i.target.value}"' .
            filter langMatches(lang(?label), "en")
            }
        
            LIMIT 10        
        `,f=`https://dbpedia.org/sparql?query=${encodeURIComponent(l)}&format=json`;w=(await(await fetch(f,{method:"GET",headers:{Accept:"application/sparql-results+json"}})).json()).results.bindings.map(a=>({label:a.label.value,image:a.image.value,id:m(a.uri.value)})),$()},s=()=>g`
            <form class="search-form">
                <label>Please search for a person</label>
                <input onkeyup=${j(c,500)} type="search" class="search-input">

                ${w.map(i=>g`
                    <a class="suggestion" href=${`/${i.id}`} onclick=${()=>w=[]}>
                        <img class="image" src=${v(i.image)} />
                        <h3 class="title">${i.label}</h3>
                    </div>
                `)}

            </form>
        `,r=()=>g`
        <div class="people">

            ${n(e[0],"influences",-1)}
            <div class="selected column">${U(e[0],0,0)}</div>
            ${e.map((i,l)=>n(i,"influenced",l+1))}

        </div>
    `;await G(document.body,t.length?r():s());for(let i of x)i.style=`--scroll: 0px; --half: ${i.clientHeight/2}px`};setTimeout(()=>{document.body.classList.remove("is-loading")},800);$();
//# sourceMappingURL=app.js.map
