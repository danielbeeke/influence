import J from"https://cdn.skypack.dev/@jacobmarshall/kv";var m=t=>t.split(/\/|#|\:/).pop(),C=(t,e)=>{var o;return(o=t.find(n=>n.lang===e))!=null?o:t[0]},d=(t,e,o={},n=[])=>{if(typeof t!="object")return t;let i=s=>{if(s.toString().includes(":")){let r=s.toString().split(":");(e==null?void 0:e[r[0]])&&(s=s.toString().replace(r[0]+":",e[r[0]]))}return s};return new Proxy(t,{get(s,r,c){var f,p;if(r==="_proxyType")return"JsonLdProxy";if(r=i(r),r==="$"&&!("$"in o))return s;if(r==="_alias")return n;if(r==="_"&&!("_"in o)){let l=a=>{var h,P;return Array.isArray(a)?l(C(a,"en")):(P=(h=a==null?void 0:a.id)!=null?h:a==null?void 0:a.value)!=null?P:a};return d(l(s),e,o,n)}if(r==="isProxy")return!0;for(let[l,a]of Object.entries(o))if(r===l)return a(s);if(r[0]==="*"){let l=r.toString().substr(1);for(let a of Object.keys(s))m(a)===l&&(r=a)}let u=!Reflect.has({},r)&&!Reflect.has([],r)&&Reflect.has(s,r);if(n.length&&!r.toString().includes(":")&&!Reflect.has({},r)&&!Reflect.has([],r))for(let l of n){let a=i(l+":"+r.toString());if(!Reflect.has({},a)&&!Reflect.has([],a)&&Reflect.has(s,a)&&Reflect.has(s,a)&&s[a])return d(s[a],e,o,n)}if(((p=(f=s[r])==null?void 0:f[0])==null?void 0:p["@list"])&&u)return d(s[r][0]["@list"],e,o,n);if(u&&s[r])return d(s[r],e,o,n);if(["filter"].includes(r.toString())){let l=Reflect.get(s,r,c);return(...a)=>l.apply(s.map(h=>d(h,e,o,n)),a)}return Reflect.get(s,r,c)},set(s,r,c){return r=i(r),s[r]=c,!0}})};var R={dbo:"http://dbpedia.org/ontology/",dbp:"http://dbpedia.org/property/",dbr:"http://dbpedia.org/resource/",foaf:"http://xmlns.com/foaf/0.1/",rdfs:"http://www.w3.org/2000/01/rdf-schema#",rdf:"http://www.w3.org/1999/02/22-rdf-syntax-ns#"};var k=J("cache"),g=async t=>{var i,s;if(!t)throw new Error("We need an identifier");let e=await k.get(t);if(!e){try{let c=`DESCRIBE <${`http://dbpedia.org/resource/${t}`}>`;e=await(await fetch(`https://dbpedia.org/sparql?default-graph-uri=http://dbpedia.org&query=${c}&format=application/json-ld`)).json()}catch(r){e=!1}await k.set(t,e)}let n=d(e,R,{},["rdfs","dbp","foaf"])[`dbr:${t}`];if((i=n==null?void 0:n["dbo:wikiPageRedirects"])==null?void 0:i._){let r=(s=n==null?void 0:n["dbo:wikiPageRedirects"])==null?void 0:s._;return g(m(r))}return n?(n._identifier=t,n):null};var j=async(t,e=null)=>{let o=t.map(s=>m(s._)).filter(Boolean);o=o.flatMap(s=>s.replaceAll(" ","_").split(",_"));let i=(await Promise.all(o.map(g))).filter(s=>{var r;return(r=s==null?void 0:s["rdf:type"])==null?void 0:r.some(c=>c._==="http://xmlns.com/foaf/0.1/Person")});return e?i.sort((s,r)=>{let c=p=>{var a;let l="";for(let h of e)if(l=(a=p[h])==null?void 0:a._.toString(),l)return l;return""},u=c(s),f=c(r);return u.localeCompare(f)}):i};import{html as w,render as Y}from"https://cdn.skypack.dev/uhtml/async";function G(t){for(var e=0,o=0;o<t.length;o++)e=t.charCodeAt(o)+((e<<5)-e);return e}function D(t){var e=(t&16777215).toString(16).toUpperCase();return"00000".substring(0,6-e.length)+e}var S=t=>D(G(t));import{html as T,render as M}from"https://cdn.skypack.dev/uhtml/async";import X from"https://cdn.skypack.dev/@jacobmarshall/kv";var y=t=>`https://images.weserv.nl/?url=${encodeURI(t)}&w=100&h=100&fit=cover&a=attention`;var _=X("thumbnailAlternative"),x=async(t,e)=>{var r,c;let o=e==null?void 0:e.replace(/[^A-Z]/g,"").split("").map(u=>u.substr(0,1)),n=t!=null?t:await _.get(e),i=()=>T`<div class="image-alternative" style=${`--color: #${S(e)}`}>
            <span>${o.join("")}</span>
        </div>`;if(n===void 0){let u=`https://en.wikipedia.org/w/api.php?action=query&origin=*&titles=${e}&prop=pageimages&format=json&pithumbsize=400`,p=await(await fetch(u,{method:"GET"})).json(),[l]=Object.keys(p.query.pages);n=(c=(r=p.query.pages[l].thumbnail)==null?void 0:r.source)!=null?c:!1,await _.set(e,n)}let s=u=>{let f=document.createElement("div");M(f,i()),u.target.replaceWith(f)};return n===!1?i():T`<img onerror=${[s,{once:!0}]} class="image" src=${y(n)} />`};import{html as q}from"https://cdn.skypack.dev/uhtml/async";function E(t,e,o=!1){var n;return function(){var i=this,s=arguments,r=function(){n=null,o||t.apply(i,s)},c=o&&!n;clearTimeout(n),n=setTimeout(r,e),c&&t.apply(i,s)}}var B=async t=>{if(t.target.value.length<4)return;let e=`
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX dbo:  <http://dbpedia.org/ontology/>
        PREFIX bif: <bif:>
        PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    
        SELECT DISTINCT ?uri ?label ?image {
    
        ?uri rdfs:label ?label .
        ?uri a <http://xmlns.com/foaf/0.1/Person> .
        ?uri dbo:thumbnail ?image .
        ?label bif:contains '"${t.target.value}"' .
        filter langMatches(lang(?label), "en")
        }
    
        LIMIT 10        
    `,o=`https://dbpedia.org/sparql?query=${encodeURIComponent(e)}&format=json`,i=await(await fetch(o,{method:"GET",headers:{Accept:"application/sparql-results+json"}})).json();v(i.results.bindings.map(s=>({label:s.label.value,image:s.image.value,id:m(s.uri.value)}))),b()},U=()=>q`
        <form class="search-form">
            <label>Please search for a person</label>
            <input onkeyup=${E(B,500)} type="search" class="search-input">

            ${$.map(t=>q`
                <a class="suggestion" href=${`/${t.id}`} onclick=${()=>v([])}>
                    <img class="image" src=${y(t.image)} />
                    <h3 class="title">${t.label}</h3>
                </div>
            `)}

        </form>
    `;document.body.addEventListener("click",t=>{let e=t.target.nodeName!=="A"?t.target.closest("a"):t.target;if(e){let o=e.getAttribute("href");o&&o[0]==="/"&&(t.preventDefault(),setTimeout(()=>{history.pushState(null,null,o),b()}))}});var H=t=>{let e=location.pathname.substr(1).split(",");return e.splice(t),`/${e.join(",")}`},W=(t,e)=>{let o=location.pathname.substr(1).split(",");return e<0?o=[t]:(o.splice(e),o[e]=t),`/${o.join(",")}`},F=(t,e=0,o)=>{var i,s,r;if(!t)return null;let n=A(t._identifier,o);return w`
        <a 
            href=${n?H(o):W(t._identifier,o)} 
            class=${`person ${n?"active":""}`} 
            style=${`--index: ${e}`}
            data-id=${t._identifier}>
        
                ${x((i=t.depiction)==null?void 0:i._,(s=t.label)==null?void 0:s._)}

                <h3 class="name">${(r=t.label)==null?void 0:r._}</h3>
        
        </a>
    `},A=(t,e)=>decodeURI(location.pathname).substr(1).split(",")[e]===t,z=t=>{let e=t.target.querySelector(".inner");e.style=`--scroll: ${t.target.scrollTop}px; --half: ${t.target.clientHeight/2}px`},K=t=>{I.push(t)},I=[],$=[],v=t=>{$=t},N=["dbo:birthDate","dbo:birthYear","dbo:activeYearsStartYear"],O=async(t,e,o)=>{var s;let n=((s=t==null?void 0:t[e])==null?void 0:s.length)?await j(t[e],N):[],i=n.some(r=>A(r._identifier,o));return w`
    <div onscroll=${z} style=${`--count: ${n.length}`} class=${`${e} column ${i?"active":""}`}>
        <div ref=${K} class="inner">
            ${n.map((r,c)=>F(r,c,o))}
            <div class="scroll-maker"></div>
        </div>
    </div>
    `},Z=t=>w`
<div class="people">
    ${O(t[0],"influences",-1)}
    <div class="selected column">${F(t[0],0,0)}</div>
    ${t.map((e,o)=>O(e,"influenced",o+1))}
</div>
`,b=async()=>{let t=decodeURI(location.pathname).substr(1).trim().split(",").filter(Boolean),e=await Promise.all(t.map(g));await Y(document.body,t.length?Z(e):U());for(let o of I)o.style=`--scroll: 0px; --half: ${o.clientHeight/2}px`};setTimeout(()=>{document.body.classList.remove("is-loading")},800);b();export{b as drawApp,$ as suggestions,v as updateSuggestions};
//# sourceMappingURL=app.js.map
