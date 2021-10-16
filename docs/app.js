import{html as p,render as x}from"https://cdn.skypack.dev/uhtml/async";function q(e){for(var t=0,r=0;r<e.length;r++)t=e.charCodeAt(r)+((t<<5)-t);return t}function M(e){var t=(e&16777215).toString(16).toUpperCase();return"00000".substring(0,6-t.length)+t}var I=e=>M(q(e));import{html as w}from"https://cdn.skypack.dev/uhtml/async";import H from"https://cdn.skypack.dev/@jacobmarshall/kv";var E=e=>`https://images.weserv.nl/?url=${encodeURI(e)}&w=100&h=100&fit=cover&a=attention`;var b=H("thumbnailAlternative"),u=async(e,t)=>{var n,i;let r=t==null?void 0:t.replace(/[^A-Z]/g,"").split("").map(d=>d.substr(0,1)),o=await b.get(t);o===void 0&&(o=e);let s=()=>w`<div class="image-alternative" style=${`--color: #${I(t)}`}>
            <span>${r.join("")}</span>
        </div>`;if(o===void 0){let d=`https://en.wikipedia.org/w/api.php?action=query&origin=*&titles=${t}&prop=pageimages&format=json&pithumbsize=400`,$=await(await fetch(d,{method:"GET"})).json(),[X]=Object.keys($.query.pages);o=(i=(n=$.query.pages[X].thumbnail)==null?void 0:n.source)!=null?i:!1,await b.set(t,o)}let a=async d=>{await b.set(t,!1)};return o===!1?s():w`<img onerror=${[a,{once:!0}]} class="image" src=${E(o)} />`};import{html as L}from"https://cdn.skypack.dev/uhtml/async";function T(e,t,r=!1){var o;return function(){var s=this,a=arguments,n=function(){o=null,r||e.apply(s,a)},i=r&&!o;clearTimeout(o),o=setTimeout(n,t),i&&e.apply(s,a)}}var G=e=>e.split(/\/|#/).pop(),Q=async e=>{if(e.target.value.length<4)return;let t=`
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
    `,r=`https://dbpedia.org/sparql?query=${encodeURIComponent(t)}&format=json`,s=await(await fetch(r,{method:"GET",headers:{Accept:"application/sparql-results+json"}})).json();h(s.results.bindings.map(a=>({label:a.label.value,image:a.image.value,id:G(a.uri.value)}))),l()},P=()=>L`
        <form class="search-form" onsubmit=${e=>e.preventDefault()}>
            <label>Please search for a person</label>
            <input onkeyup=${T(Q,500)} type="search" class="search-input">

            ${m.map(e=>L`
                <a class="suggestion" href=${`/${e.id}`} onclick=${()=>h([])}>
                    ${u(e.image,e.label)}
                    <h3 class="title">${e.label}</h3>
                </div>
            `)}

        </form>
    `;var z=(e,t,r=!1)=>`
    PREFIX dbo: <http://dbpedia.org/ontology/>
    PREFIX dbr: <http://dbpedia.org/resource/>

    SELECT DISTINCT (REPLACE(STR(?person), "http://dbpedia.org/resource/", "") as ?id) ?label ?image ${r?" ?abstract ":""}
    WHERE {
        <http://dbpedia.org/resource/${e}> rdfs:label ?label .
        BIND (<http://dbpedia.org/resource/${e}> as ?person)
        ${r?" ?person dbo:abstract  ?abstract . ":""}
        OPTIONAL {<http://dbpedia.org/resource/${e}> foaf:depiction ?image }
        FILTER (lang(?label) = '${t}')
    }
`,S=(e,t,r)=>`
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
        FILTER (lang(?label) = '${r}')
    }
    ORDER BY ASC(?date)

    LIMIT 1000
`,g=async e=>(e=e.replaceAll(`
`," "),await(await fetch(`https://dbpedia.org/sparql?default-graph-uri=http://dbpedia.org&query=${e}&format=application/json-ld`)).json()),v=(e,t=!1)=>{let r=e.head.vars,o=e.results.bindings.map(s=>{var n;let a={};for(let i of r)a[i]=(n=s[i])==null?void 0:n.value;return a});return t?o[0]:o},y=async(e,t="en",r=!1)=>{let o=await g(z(e,t,r));return v(o,!0)},A=async(e,t="en")=>{let r=await g(S(e,"person",t));return v(r)},R=async(e,t="en")=>{let r=await g(S(e,"others",t));return v(r)};var W={37:1,38:1,39:1,40:1};function c(e){e.preventDefault()}function C(e){if(W[e.keyCode])return c(e),!1}var j=!1;try{window.addEventListener("test",null,Object.defineProperty({},"passive",{get:function(){j=!0}}))}catch(e){}var f=j?{passive:!1}:!1,k="onwheel"in document.createElement("div")?"wheel":"mousewheel";function D(e){e.addEventListener("DOMMouseScroll",c,!1),e.addEventListener(k,c,f),e.addEventListener("touchmove",c,f),e.addEventListener("keydown",C,!1)}function O(e){e.removeEventListener("DOMMouseScroll",c,!1),e.removeEventListener(k,c,f),e.removeEventListener("touchmove",c,f),e.removeEventListener("keydown",C,!1)}document.body.addEventListener("click",e=>{let t=e.target.nodeName!=="A"?e.target.closest("a"):e.target;if(t){let r=t.getAttribute("href");r&&r[0]==="/"&&(e.preventDefault(),setTimeout(()=>{history.pushState(null,null,r),l()}))}});window.addEventListener("popstate",e=>{l()});var K=e=>{let t=location.pathname.substr(1).split(",");return t.splice(e),`/${t.join(",")}`},Z=(e,t)=>{let r=location.pathname.substr(1).split(",");return t<0?r=[e]:(r.splice(t),r[t]=e),`/${r.join(",")}`},F=(e,t=0,r)=>{let o=Y(e.id,r);return p`
        <div 
            class=${`person ${o?"active":""}`} 
            style=${`--index: ${t}`}
            data-id=${e.id}>
        
                ${u(e.image,e.label)}

                <button class="zoom" onclick=${()=>{location.hash=e.id,l()}}></button>

                <h3 class="name">
                <span>
                    ${e.label}
                    </span>
                        <a class="action-button" href=${o?K(r):Z(e.id,r)}></a>        
                </h3>
        
        </div>
    `},N=()=>decodeURI(location.pathname).substr(1).split(",").filter(Boolean),Y=(e,t)=>N()[t]===e,J=e=>{let t=e.target.querySelector(".inner");t.style=`--scroll: ${e.target.scrollTop}px; --half: ${e.target.clientHeight/2}px`},U=[],m=[],h=e=>{m=e},B=async(e,t,r)=>{let o=await t(e),s=o.some(a=>Y(a.id,r));return p`
    <div ref=${a=>U.push(a)} onscroll=${J} style=${`--count: ${o.length}`} class=${`column ${s?"active":"is-loading"}`}>
        <div class="inner" style=${`--scroll: 0px; --half: ${Math.min(o.length*55+20,window.innerHeight)/2}px`}>
            ${o.map((a,n)=>F(a,n,r))}
            <div class="scroll-maker"></div>
        </div>
    </div>
    `},V=async e=>{let t=await y(e[0]),r=null;if(location.hash){let o=decodeURI(location.hash).substr(1),s=await y(o,"en",!0);console.log(s)}return p`
        <div class="people">
            ${B(e[0],R,-1)}
            <div class="selected column">${F(t,0,0)}</div>
            ${e.map((o,s)=>B(o,A,s+1))}
        </div>

        ${r?p`
            <div class="more-information">
            
            </div>
        `:null}
    `},_=!1,l=async()=>{let e=N();try{await x(document.body,e.length?V(e):P())}catch(t){t.message==="NetworkError when attempting to fetch resource."?(_=!0,x(document.body,p`<h1 class="dbpedia-offline">Unfortunatly DBpedia is down.<br>Please come back later.</h1>`)):console.info(t.message)}for(let[t,r]of U.entries())r.classList.contains("active")?D(r):O(r),setTimeout(()=>r.classList.remove("is-loading"),500)};setTimeout(()=>document.body.classList.remove("is-loading"),800);l();export{l as drawApp,m as suggestions,h as updateSuggestions};
//# sourceMappingURL=app.js.map
