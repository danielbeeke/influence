import V from"https://cdn.skypack.dev/@jacobmarshall/kv";var p=e=>e.split(/\/|#/).pop(),Q=(e,t)=>{var s;return(s=e.find(o=>o.lang===t))!=null?s:e[0]},g=(e,t,s={},o=[])=>{if(typeof e!="object")return e;let i=a=>{if(a.toString().includes(":")){let n=a.toString().split(":");(t==null?void 0:t[n[0]])&&(a=a.toString().replace(n[0]+":",t[n[0]]))}return a};return new Proxy(e,{get(a,n,c){var d,m;if(n==="_proxyType")return"JsonLdProxy";if(n=i(n),n==="$"&&!("$"in s))return a;if(n==="_alias")return o;if(n==="_"&&!("_"in s)){let f=r=>{var l,h;return Array.isArray(r)?f(Q(r,"en")):(h=(l=r==null?void 0:r.id)!=null?l:r==null?void 0:r.value)!=null?h:r};return g(f(a),t,s,o)}if(n==="isProxy")return!0;for(let[f,r]of Object.entries(s))if(n===f)return r(a);if(n[0]==="*"){let f=n.toString().substr(1);for(let r of Object.keys(a))p(r)===f&&(n=r)}let u=!Reflect.has({},n)&&!Reflect.has([],n)&&Reflect.has(a,n);if(o.length&&!n.toString().includes(":")&&!Reflect.has({},n)&&!Reflect.has([],n))for(let f of o){let r=i(f+":"+n.toString());if(!Reflect.has({},r)&&!Reflect.has([],r)&&Reflect.has(a,r)&&Reflect.has(a,r)&&a[r])return g(a[r],t,s,o)}if(((m=(d=a[n])==null?void 0:d[0])==null?void 0:m["@list"])&&u)return g(a[n][0]["@list"],t,s,o);if(u&&a[n])return g(a[n],t,s,o);if(["filter"].includes(n.toString())){let f=Reflect.get(a,n,c);return(...r)=>f.apply(a.map(l=>g(l,t,s,o)),r)}return Reflect.get(a,n,c)},set(a,n,c){return n=i(n),a[n]=c,!0}})};var T={dbo:"http://dbpedia.org/ontology/",dbp:"http://dbpedia.org/property/",dbr:"http://dbpedia.org/resource/",foaf:"http://xmlns.com/foaf/0.1/",rdfs:"http://www.w3.org/2000/01/rdf-schema#",rdf:"http://www.w3.org/1999/02/22-rdf-syntax-ns#"};var L=V("cache"),S=async(e,t="resource")=>{var a,n;if(!e)throw new Error("We need an identifier");let s=await L.get(e);if(!s){try{let c=`http://dbpedia.org/${t}/${e}`;if(t==="data")s=await(await fetch(c+".json")).json();else{let u=`DESCRIBE <${c}>`;s=await(await fetch(`https://dbpedia.org/sparql?default-graph-uri=http://dbpedia.org&query=${u}&format=application/json-ld`)).json()}}catch(c){s=!1}await L.set(e,s)}let o=g(s,T,{},["rdfs","dbp","foaf"]),i=t==="data"?o:o[`dbr:${e}`];if((a=i==null?void 0:i["dbo:wikiPageRedirects"])==null?void 0:a._){let c=(n=i==null?void 0:i["dbo:wikiPageRedirects"])==null?void 0:n._;return v(p(c))}return i?(i._identifier=e,i):null},v=async e=>S(e);var U=e=>["http://xmlns.com/foaf/0.1/Person","http://dbpedia.org/class/yago/LivingThing100004258","http://dbpedia.org/class/yago/Person100007846","http://dbpedia.org/ontology/Person"].includes(e),x=async(e,t=null)=>{let s=e.map(r=>p(r._)).filter(Boolean);s=s.flatMap(r=>r.replace(/ /g,"_").replaceAll(`
`,"").split(/,|\*_/)).filter(Boolean);let o=await Promise.all(s.map(v)),i=o.filter(r=>{var l;return(l=r==null?void 0:r["http://www.w3.org/ns/prov#wasDerivedFrom"])==null?void 0:l._.includes("List_of_")}).flatMap(r=>r["dbo:wikiPageWikiLink"].map(l=>p(l._))),a=await Promise.all(i.map(v));o=[...o,...a];let c=o.filter(r=>{var l;return!((l=r==null?void 0:r["rdf:type"])==null?void 0:l.some(h=>U(h._)))}).filter(r=>{var l;return((l=r==null?void 0:r["rdf:type"])==null?void 0:l._)===void 0&&(r==null?void 0:r["dbo:wikiPageWikiLink"].length)===1}).map(r=>{var l;return p((l=r["dbo:wikiPageWikiLink"])==null?void 0:l._)}),d=(await Promise.all(c.map(r=>S(r,"data")))).flatMap(r=>Object.keys(r).map(p)).filter(r=>!r.includes("Category:")),m=await Promise.all(d.map(v));o=[...o,...m];let f=o.filter(r=>{var l;return(l=r==null?void 0:r["rdf:type"])==null?void 0:l.some(h=>U(h._))});return t?f.sort((r,l)=>{let h=N=>{var _;let R="";for(let Z of t)if(R=(_=N[Z])==null?void 0:_._.toString(),R)return R;return""},K=h(r),z=h(l);return K.localeCompare(z)}):f};import{html as j,render as ae}from"https://cdn.skypack.dev/uhtml/async";function ee(e){for(var t=0,s=0;s<e.length;s++)t=e.charCodeAt(s)+((t<<5)-t);return t}function te(e){var t=(e&16777215).toString(16).toUpperCase();return"00000".substring(0,6-t.length)+t}var F=e=>te(ee(e));import{html as I,render as re}from"https://cdn.skypack.dev/uhtml/async";import se from"https://cdn.skypack.dev/@jacobmarshall/kv";var y=e=>`https://images.weserv.nl/?url=${encodeURI(e)}&w=100&h=100&fit=cover&a=attention`;var E=se("thumbnailAlternative"),q=async(e,t)=>{var n,c;let s=t==null?void 0:t.replace(/[^A-Z]/g,"").split("").map(u=>u.substr(0,1)),o=await E.get(t);o===void 0&&(o=e);let i=()=>I`<div class="image-alternative" style=${`--color: #${F(t)}`}>
            <span>${s.join("")}</span>
        </div>`;if(o===void 0){let u=`https://en.wikipedia.org/w/api.php?action=query&origin=*&titles=${t}&prop=pageimages&format=json&pithumbsize=400`,m=await(await fetch(u,{method:"GET"})).json(),[f]=Object.keys(m.query.pages);o=(c=(n=m.query.pages[f].thumbnail)==null?void 0:n.source)!=null?c:!1,await E.set(t,o)}let a=async u=>{let d=document.createElement("div");re(d,i()),u.target.replaceWith(d),console.log(t),await E.set(t,!1)};return o===!1?i():I`<img onerror=${[a,{once:!0}]} class="image" src=${y(o)} />`};import{html as A}from"https://cdn.skypack.dev/uhtml/async";function O(e,t,s=!1){var o;return function(){var i=this,a=arguments,n=function(){o=null,s||e.apply(i,a)},c=s&&!o;clearTimeout(o),o=setTimeout(n,t),c&&e.apply(i,a)}}var oe=async e=>{if(e.target.value.length<4)return;let t=`
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX dbo:  <http://dbpedia.org/ontology/>
        PREFIX bif: <bif:>
        PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    
        SELECT DISTINCT ?uri ?label ?image {
    
        ?uri rdfs:label ?label .
        ?uri a <http://xmlns.com/foaf/0.1/Person> .
        ?uri dbo:thumbnail ?image .
        ?label bif:contains '"${e.target.value}"' .
        filter langMatches(lang(?label), "en")
        }
    
        LIMIT 10        
    `,s=`https://dbpedia.org/sparql?query=${encodeURIComponent(t)}&format=json`,i=await(await fetch(s,{method:"GET",headers:{Accept:"application/sparql-results+json"}})).json();$(i.results.bindings.map(a=>({label:a.label.value,image:a.image.value,id:p(a.uri.value)}))),b()},C=()=>A`
        <form class="search-form">
            <label>Please search for a person</label>
            <input onkeyup=${O(oe,500)} type="search" class="search-input">

            ${P.map(e=>A`
                <a class="suggestion" href=${`/${e.id}`} onclick=${()=>$([])}>
                    <img class="image" src=${y(e.image)} />
                    <h3 class="title">${e.label}</h3>
                </div>
            `)}

        </form>
    `;var ne={37:1,38:1,39:1,40:1};function w(e){e.preventDefault()}function D(e){if(ne[e.keyCode])return w(e),!1}var M=!1;try{window.addEventListener("test",null,Object.defineProperty({},"passive",{get:function(){M=!0}}))}catch(e){}var k=M?{passive:!1}:!1,J="onwheel"in document.createElement("div")?"wheel":"mousewheel";function G(e){e.addEventListener("DOMMouseScroll",w,!1),e.addEventListener(J,w,k),e.addEventListener("touchmove",w,k),e.addEventListener("keydown",D,!1)}function W(e){e.removeEventListener("DOMMouseScroll",w,!1),e.removeEventListener(J,w,k),e.removeEventListener("touchmove",w,k),e.removeEventListener("keydown",D,!1)}document.body.addEventListener("click",e=>{let t=e.target.nodeName!=="A"?e.target.closest("a"):e.target;if(t){let s=t.getAttribute("href");s&&s[0]==="/"&&(e.preventDefault(),setTimeout(()=>{history.pushState(null,null,s),b()}))}});var ie=e=>{let t=location.pathname.substr(1).split(",");return t.splice(e),`/${t.join(",")}`},le=(e,t)=>{let s=location.pathname.substr(1).split(",");return t<0?s=[e]:(s.splice(t),s[t]=e),`/${s.join(",")}`},X=(e,t=0,s)=>{var i,a,n;if(!e)return null;let o=B(e._identifier,s);return j`
        <a 
            href=${o?ie(s):le(e._identifier,s)} 
            class=${`person ${o?"active":""}`} 
            style=${`--index: ${t}`}
            data-id=${e._identifier}>
        
                ${q((i=e.depiction)==null?void 0:i._,(a=e.label)==null?void 0:a._)}

                <h3 class="name">${(n=e.label)==null?void 0:n._}</h3>
        
        </a>
    `},B=(e,t)=>decodeURI(location.pathname).substr(1).split(",")[t]===e,ce=e=>{let t=e.target.querySelector(".inner");t.style=`--scroll: ${e.target.scrollTop}px; --half: ${e.target.clientHeight/2}px`},fe=e=>{Y.push(e)},Y=[],P=[],$=e=>{P=e},ue=["dbo:birthDate","dbo:birthYear","dbo:activeYearsStartYear"],H=async(e,t,s)=>{var a;let o=((a=e==null?void 0:e[t])==null?void 0:a.length)?await x(e[t],ue):[],i=o.some(n=>B(n._identifier,s));return j`
    <div onscroll=${ce} style=${`--count: ${o.length}`} class=${`${t} column ${i?"active":"is-loading"}`}>
        <div ref=${fe} class="inner">
            ${o.map((n,c)=>X(n,c,s))}
            <div class="scroll-maker"></div>
        </div>
    </div>
    `},pe=e=>j`
<div class="people">
    ${H(e[0],"influences",-1)}
    <div class="selected column">${X(e[0],0,0)}</div>
    ${e.map((t,s)=>H(t,"influenced",s+1))}
</div>
`,b=async()=>{let e=decodeURI(location.pathname).substr(1).trim().split(",").filter(Boolean),t=await Promise.all(e.map(v));await ae(document.body,e.length?pe(t):C());for(let[s,o]of Y.entries())o.parentElement.classList.contains("active")?G(o.parentElement):W(o.parentElement),o.style=`--scroll: 0px; --half: ${o.clientHeight/2}px`,setTimeout(()=>{o.parentElement.classList.remove("is-loading")},500)};setTimeout(()=>{document.body.classList.remove("is-loading")},800);b();export{b as drawApp,P as suggestions,$ as updateSuggestions};
//# sourceMappingURL=app.js.map
