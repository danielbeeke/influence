import{html as v,render as W}from"https://cdn.skypack.dev/uhtml/async";function q(e){for(var t=0,r=0;r<e.length;r++)t=e.charCodeAt(r)+((t<<5)-t);return t}function B(e){var t=(e&16777215).toString(16).toUpperCase();return"00000".substring(0,6-t.length)+t}var E=e=>B(q(e));import{html as $}from"https://cdn.skypack.dev/uhtml/async";import X from"https://cdn.skypack.dev/@jacobmarshall/kv";var d=e=>`https://images.weserv.nl/?url=${encodeURI(e)}&w=100&h=100&fit=cover&a=attention`;var f=X("thumbnailAlternative"),I=async(e,t)=>{var n,i;let r=t==null?void 0:t.replace(/[^A-Z]/g,"").split("").map(p=>p.substr(0,1)),s=await f.get(t);s===void 0&&(s=e);let o=()=>$`<div class="image-alternative" style=${`--color: #${E(t)}`}>
            <span>${r.join("")}</span>
        </div>`;if(s===void 0){let p=`https://en.wikipedia.org/w/api.php?action=query&origin=*&titles=${t}&prop=pageimages&format=json&pithumbsize=400`,y=await(await fetch(p,{method:"GET"})).json(),[U]=Object.keys(y.query.pages);s=(i=(n=y.query.pages[U].thumbnail)==null?void 0:n.source)!=null?i:!1,await f.set(t,s)}let a=async p=>{await f.set(t,!1)};return s===!1?o():$`<img onerror=${[a,{once:!0}]} class="image" src=${d(s)} />`};import{html as w}from"https://cdn.skypack.dev/uhtml/async";function T(e,t,r=!1){var s;return function(){var o=this,a=arguments,n=function(){s=null,r||e.apply(o,a)},i=r&&!s;clearTimeout(s),s=setTimeout(n,t),i&&e.apply(o,a)}}var M=e=>e.split(/\/|#/).pop(),H=async e=>{if(e.target.value.length<4)return;let t=`
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
    `,r=`https://dbpedia.org/sparql?query=${encodeURIComponent(t)}&format=json`,o=await(await fetch(r,{method:"GET",headers:{Accept:"application/sparql-results+json"}})).json();u(o.results.bindings.map(a=>({label:a.label.value,image:a.image.value,id:M(a.uri.value)}))),c()},L=()=>w`
        <form class="search-form">
            <label>Please search for a person</label>
            <input onkeyup=${T(H,500)} type="search" class="search-input">

            ${m.map(e=>w`
                <a class="suggestion" href=${`/${e.id}`} onclick=${()=>u([])}>
                    <img class="image" src=${d(e.image)} />
                    <h3 class="title">${e.label}</h3>
                </div>
            `)}

        </form>
    `;var G=(e,t)=>`
    PREFIX dbo: <http://dbpedia.org/ontology/>
    PREFIX dbr: <http://dbpedia.org/resource/>

    SELECT DISTINCT (REPLACE(STR(?person), "http://dbpedia.org/resource/", "") as ?id) ?label ?image
    WHERE {
        dbr:${e} rdfs:label ?label .
        BIND (dbr:${e} as ?person)
        OPTIONAL {dbr:${e} foaf:depiction ?image }
        FILTER (lang(?label) = '${t}')
    }
`,P=(e,t,r)=>`
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX dbo: <http://dbpedia.org/ontology/>
    PREFIX dbp: <http://dbpedia.org/property/>
    PREFIX dbr: <http://dbpedia.org/resource/>

    SELECT DISTINCT (REPLACE(STR(?person), "http://dbpedia.org/resource/", "") as ?id) ?label ?image
    WHERE {
        ?person rdfs:label ?label .
        { SELECT DISTINCT ?person { dbr:${e} ${t==="person"?"dbo:influenced|^dbo:influencedBy":"dbo:influencedBy|^dbo:influenced"} ?person . }}
        OPTIONAL {?person dbo:birthDate ?birthDate}
        OPTIONAL {?person dbp:birthDate ?birthDateProperty}
        OPTIONAL {?person dbo:birthYear ?birthYear}
        OPTIONAL {?person dbp:birthYear ?birthYearProperty}
        OPTIONAL {?person dbo:activeYearsStartYear ?activeYearsStartYear}
        OPTIONAL {?person dbp:activeYearsStartYear ?activeYearsStartYearProperty}
        OPTIONAL {?person foaf:depiction ?image }
        BIND (COALESCE(?birthDate, ?birthDateProperty, ?birthYear, ?birthYearProperty, ?activeYearsStartYear, ?activeYearsStartYearProperty) as ?date)
        FILTER isIRI(?person) 
        FILTER (lang(?label) = '${r}')
    }
    ORDER BY ASC(?date)

    LIMIT 1000
`,b=async e=>await(await fetch(`https://dbpedia.org/sparql?default-graph-uri=http://dbpedia.org&query=${e}&format=application/json-ld`)).json(),g=(e,t=!1)=>{let r=e.head.vars,s=e.results.bindings.map(o=>{var n;let a={};for(let i of r)a[i]=(n=o[i])==null?void 0:n.value;return a});return t?s[0]:s},S=async(e,t="en")=>{let r=await b(G(e,t));return g(r,!0)},R=async(e,t="en")=>{let r=await b(P(e,"person",t));return g(r)},A=async(e,t="en")=>{let r=await b(P(e,"others",t));return g(r)};var Q={37:1,38:1,39:1,40:1};function l(e){e.preventDefault()}function j(e){if(Q[e.keyCode])return l(e),!1}var C=!1;try{window.addEventListener("test",null,Object.defineProperty({},"passive",{get:function(){C=!0}}))}catch(e){}var h=C?{passive:!1}:!1,O="onwheel"in document.createElement("div")?"wheel":"mousewheel";function k(e){e.addEventListener("DOMMouseScroll",l,!1),e.addEventListener(O,l,h),e.addEventListener("touchmove",l,h),e.addEventListener("keydown",j,!1)}function D(e){e.removeEventListener("DOMMouseScroll",l,!1),e.removeEventListener(O,l,h),e.removeEventListener("touchmove",l,h),e.removeEventListener("keydown",j,!1)}document.body.addEventListener("click",e=>{let t=e.target.nodeName!=="A"?e.target.closest("a"):e.target;if(t){let r=t.getAttribute("href");r&&r[0]==="/"&&(e.preventDefault(),setTimeout(()=>{history.pushState(null,null,r),c()}))}});var z=e=>{let t=location.pathname.substr(1).split(",");return t.splice(e),`/${t.join(",")}`},K=(e,t)=>{let r=location.pathname.substr(1).split(",");return t<0?r=[e]:(r.splice(t),r[t]=e),`/${r.join(",")}`},Y=(e,t=0,r)=>{let s=x(e.id,r);return v`
        <a 
            href=${s?z(r):K(e.id,r)} 
            class=${`person ${s?"active":""}`} 
            style=${`--index: ${t}`}
            data-id=${e.id}>
        
                ${I(e.image,e.label)}

                <h3 class="name">${e.label}</h3>
        
        </a>
    `},x=(e,t)=>decodeURI(location.pathname).substr(1).split(",")[t]===e,Z=e=>{let t=e.target.querySelector(".inner");t.style=`--scroll: ${e.target.scrollTop}px; --half: ${e.target.clientHeight/2}px`},J=e=>{F.push(e)},F=[],m=[],u=e=>{m=e},N=async(e,t,r)=>{let s=await t(e),o=s.some(a=>x(a.id,r));return v`
    <div onscroll=${Z} style=${`--count: ${s.length}`} class=${`column ${o?"active":"is-loading"}`}>
        <div ref=${J} class="inner">
            ${s.map((a,n)=>Y(a,n,r))}
            <div class="scroll-maker"></div>
        </div>
    </div>
    `},V=async e=>{let t=await S(e[0]);return v`
    <div class="people">
        ${N(e[0],A,-1)}
        <div class="selected column">${Y(t,0,0)}</div>
        ${e.map((r,s)=>N(r,R,s+1))}
    </div>
    `},c=async()=>{let e=decodeURI(location.pathname).substr(1).trim().split(",").filter(Boolean);try{await W(document.body,e.length?V(e):L())}catch(t){console.info(t)}for(let[t,r]of F.entries())r.parentElement.classList.contains("active")?k(r.parentElement):D(r.parentElement),r.style=`--scroll: 0px; --half: ${r.clientHeight/2}px`,setTimeout(()=>{r.parentElement.classList.remove("is-loading")},500)};setTimeout(()=>{document.body.classList.remove("is-loading")},800);c();export{c as drawApp,m as suggestions,u as updateSuggestions};
//# sourceMappingURL=app.js.map
