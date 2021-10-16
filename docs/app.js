import{html as p,render as x}from"https://cdn.skypack.dev/uhtml/async";function q(e){for(var t=0,s=0;s<e.length;s++)t=e.charCodeAt(s)+((t<<5)-t);return t}function M(e){var t=(e&16777215).toString(16).toUpperCase();return"00000".substring(0,6-t.length)+t}var I=e=>M(q(e));import{html as w}from"https://cdn.skypack.dev/uhtml/async";import H from"https://cdn.skypack.dev/@jacobmarshall/kv";var E=e=>`https://images.weserv.nl/?url=${encodeURI(e)}&w=100&h=100&fit=cover&a=attention`;var b=H("thumbnailAlternative"),u=async(e,t)=>{var n,l;let s=t==null?void 0:t.replace(/[^A-Z]/g,"").split("").map(d=>d.substr(0,1)),r=await b.get(t);r===void 0&&(r=e);let o=()=>w`<div class="image-alternative" style=${`--color: #${I(t)}`}>
            <span>${s.join("")}</span>
        </div>`;if(r===void 0){let d=`https://en.wikipedia.org/w/api.php?action=query&origin=*&titles=${t}&prop=pageimages&format=json&pithumbsize=400`,$=await(await fetch(d,{method:"GET"})).json(),[X]=Object.keys($.query.pages);r=(l=(n=$.query.pages[X].thumbnail)==null?void 0:n.source)!=null?l:!1,await b.set(t,r)}let a=async d=>{await b.set(t,!1)};return r===!1?o():w`<img onerror=${[a,{once:!0}]} class="image" src=${E(r)} />`};import{html as P}from"https://cdn.skypack.dev/uhtml/async";function T(e,t,s=!1){var r;return function(){var o=this,a=arguments,n=function(){r=null,s||e.apply(o,a)},l=s&&!r;clearTimeout(r),r=setTimeout(n,t),l&&e.apply(o,a)}}var G=e=>e.split(/\/|#/).pop(),Q=async e=>{if(e.target.value.length<4)return;let t=`
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
    `,s=`https://dbpedia.org/sparql?query=${encodeURIComponent(t)}&format=json`,o=await(await fetch(s,{method:"GET",headers:{Accept:"application/sparql-results+json"}})).json();h(o.results.bindings.map(a=>({label:a.label.value,image:a.image.value,id:G(a.uri.value)}))),i()},L=()=>P`
        <form class="search-form" onsubmit=${e=>e.preventDefault()}>
            <label>Please search for a person</label>
            <input onkeyup=${T(Q,500)} type="search" class="search-input">

            ${m.map(e=>P`
                <a class="suggestion" href=${`/${e.id}`} onclick=${()=>h([])}>
                    ${u(e.image,e.label)}
                    <h3 class="title">${e.label}</h3>
                </div>
            `)}

        </form>
    `;var z=(e,t,s=!1)=>`
    PREFIX dbo: <http://dbpedia.org/ontology/>
    PREFIX dbr: <http://dbpedia.org/resource/>

    SELECT DISTINCT (REPLACE(STR(?person), "http://dbpedia.org/resource/", "") as ?id) ?label ?image ${s?" ?abstract ":""}
    WHERE {
        <http://dbpedia.org/resource/${e}> rdfs:label ?label .
        ${s?`OPTIONAL { <http://dbpedia.org/resource/${e}> dbo:abstract  ?abstract }`:""}
        BIND (<http://dbpedia.org/resource/${e}> as ?person)
        OPTIONAL {<http://dbpedia.org/resource/${e}> foaf:depiction ?image }
        FILTER (lang(?label) = '${t}')
        ${s?`FILTER (lang(?abstract) = '${t}')`:""}
    }
`,S=(e,t,s)=>`
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX dbo: <http://dbpedia.org/ontology/>
    PREFIX dbp: <http://dbpedia.org/property/>
    PREFIX dbr: <http://dbpedia.org/resource/>

    SELECT DISTINCT (REPLACE(STR(?person), "http://dbpedia.org/resource/", "") as ?id) ?label ?image
    WHERE {
        ?person rdfs:label ?label .
        { SELECT DISTINCT ?person { <http://dbpedia.org/resource/${e}> ${t==="person"?"dbo:influenced|^dbo:influencedBy":"dbo:influencedBy|^dbo:influenced"} ?person . }}
        OPTIONAL {?person dbo:birthDate ?birthDate}
        OPTIONAL {?person dbp:birthDate ?birthDateProperty}
        OPTIONAL {?person dbo:birthYear ?birthYear}
        OPTIONAL {?person dbp:birthYear ?birthYearProperty}
        OPTIONAL {?person dbo:activeYearsStartYear ?activeYearsStartYear}
        OPTIONAL {?person dbp:activeYearsStartYear ?activeYearsStartYearProperty}
        OPTIONAL {?person foaf:depiction ?image }
        BIND (COALESCE(?birthDate, ?birthDateProperty, ?birthYear, ?birthYearProperty, ?activeYearsStartYear, ?activeYearsStartYearProperty) as ?date)
        FILTER isIRI(?person) 
        FILTER (lang(?label) = '${s}')
    }
    ORDER BY ASC(?date)

    LIMIT 1000
`,g=async e=>(e=e.replaceAll(`
`," "),await(await fetch(`https://dbpedia.org/sparql?default-graph-uri=http://dbpedia.org&query=${e}&format=application/json-ld`)).json()),v=(e,t=!1)=>{let s=e.head.vars,r=e.results.bindings.map(o=>{var n;let a={};for(let l of s)a[l]=(n=o[l])==null?void 0:n.value;return a});return t?r[0]:r},y=async(e,t="en",s=!1)=>{let r=await g(z(e,t,s));return v(r,!0)},A=async(e,t="en")=>{let s=await g(S(e,"person",t));return v(s)},R=async(e,t="en")=>{let s=await g(S(e,"others",t));return v(s)};var W={37:1,38:1,39:1,40:1};function c(e){e.preventDefault()}function O(e){if(W[e.keyCode])return c(e),!1}var k=!1;try{window.addEventListener("test",null,Object.defineProperty({},"passive",{get:function(){k=!0}}))}catch(e){}var f=k?{passive:!1}:!1,j="onwheel"in document.createElement("div")?"wheel":"mousewheel";function C(e){e.addEventListener("DOMMouseScroll",c,!1),e.addEventListener(j,c,f),e.addEventListener("touchmove",c,f),e.addEventListener("keydown",O,!1)}function D(e){e.removeEventListener("DOMMouseScroll",c,!1),e.removeEventListener(j,c,f),e.removeEventListener("touchmove",c,f),e.removeEventListener("keydown",O,!1)}document.body.addEventListener("click",e=>{let t=e.target.nodeName!=="A"?e.target.closest("a"):e.target;if(t){let s=t.getAttribute("href");s&&s[0]==="/"&&(e.preventDefault(),setTimeout(()=>{history.pushState(null,null,s),i()}))}});window.addEventListener("popstate",e=>{i()});var K=e=>{let t=location.pathname.substr(1).split(",");return t.splice(e),`/${t.join(",")}`},Z=(e,t)=>{let s=location.pathname.substr(1).split(",");return t<0?s=[e]:(s.splice(t),s[t]=e),`/${s.join(",")}`},F=(e,t=0,s)=>{let r=Y(e.id,s);return p`
        <div 
            class=${`person ${r?"active":""}`} 
            style=${`--index: ${t}`}
            data-id=${e.id}>
        
                ${u(e.image,e.label)}

                <button class="zoom" onclick=${()=>{location.hash=e.id,i()}}></button>

                <h3 class="name">
                <span>
                    ${e.label}
                    </span>
                        <a class="action-button" href=${r?K(s):Z(e.id,s)}></a>        
                </h3>
        
        </div>
    `},N=()=>decodeURI(location.pathname).substr(1).split(",").filter(Boolean),Y=(e,t)=>N()[t]===e,J=e=>{let t=e.target.querySelector(".inner");t.style=`--scroll: ${e.target.scrollTop}px; --half: ${e.target.clientHeight/2}px`},U=[],m=[],h=e=>{m=e},B=async(e,t,s)=>{let r=await t(e),o=r.some(a=>Y(a.id,s));return p`
    <div ref=${a=>U.push(a)} onscroll=${J} style=${`--count: ${r.length}`} class=${`column ${o?"active":"is-loading"}`}>
        <div class="inner" style=${`--scroll: 0px; --half: ${Math.min(r.length*55+40,window.innerHeight-40)/2}px`}>
            ${r.map((a,n)=>F(a,n,s))}
            <div class="scroll-maker"></div>
        </div>
    </div>
    `},V=()=>{location.hash="",i()},_=async e=>{let t=await Promise.all(e.map(r=>y(r))),s=null;if(location.hash){let r=decodeURI(location.hash).substr(1);s=r?await y(r,"en",!0):null}return document.body.dataset.selectedPerson=(!!s).toString(),p`
        ${s?p`
        <div class="selected-person">
            <h1 class="title">${s.label} <button class="close" onclick=${V}></button></h1>
            <div class="abstract">
                ${s.image?p`<img class="image" src=${`https://images.weserv.nl/?url=${s.image}&w=300`} />`:null}
                ${s.abstract}
            </div>
        </div>        
        `:null}

        <div class="headers">
            <h3 class="column-title">${`Influencers of ${t[0].label}`}</h3>
            <h3 class="column-title selected">Your starting selection:</h3>
            ${e.map((r,o)=>p`<h3 class="column-title">Influenced by ${t[o].label}</h3>`)}
        </div>
        <div class="people">
            ${B(e[0],R,-1)}
            <div class="selected column" style="--count: 1">
                <div class="inner" style="--half: 47px;">
                ${F(t[0],0,0)}
                </div>
            </div>
            ${e.map((r,o)=>B(r,A,o+1))}
        </div>
    `},i=async()=>{let e=N();try{await x(document.body,e.length?_(e):L())}catch(t){t.message==="NetworkError when attempting to fetch resource."?x(document.body,p`<h1 class="dbpedia-offline">Unfortunatly DBpedia is down.<br>Please come back later.</h1>`):console.info(t.message)}for(let[t,s]of U.entries())s.classList.contains("active")?C(s):D(s),setTimeout(()=>s.classList.remove("is-loading"),500)};setTimeout(()=>document.body.classList.remove("is-loading"),800);i();export{i as drawApp,m as suggestions,h as updateSuggestions};
//# sourceMappingURL=app.js.map
