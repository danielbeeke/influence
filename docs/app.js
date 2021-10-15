import{html as v,render as z}from"https://cdn.skypack.dev/uhtml/async";function X(e){for(var t=0,r=0;r<e.length;r++)t=e.charCodeAt(r)+((t<<5)-t);return t}function q(e){var t=(e&16777215).toString(16).toUpperCase();return"00000".substring(0,6-t.length)+t}var $=e=>q(X(e));import{html as I}from"https://cdn.skypack.dev/uhtml/async";import M from"https://cdn.skypack.dev/@jacobmarshall/kv";var E=e=>`https://images.weserv.nl/?url=${encodeURI(e)}&w=100&h=100&fit=cover&a=attention`;var f=M("thumbnailAlternative"),d=async(e,t)=>{var n,i;let r=t==null?void 0:t.replace(/[^A-Z]/g,"").split("").map(p=>p.substr(0,1)),o=await f.get(t);o===void 0&&(o=e);let a=()=>I`<div class="image-alternative" style=${`--color: #${$(t)}`}>
            <span>${r.join("")}</span>
        </div>`;if(o===void 0){let p=`https://en.wikipedia.org/w/api.php?action=query&origin=*&titles=${t}&prop=pageimages&format=json&pithumbsize=400`,y=await(await fetch(p,{method:"GET"})).json(),[B]=Object.keys(y.query.pages);o=(i=(n=y.query.pages[B].thumbnail)==null?void 0:n.source)!=null?i:!1,await f.set(t,o)}let s=async p=>{await f.set(t,!1)};return o===!1?a():I`<img onerror=${[s,{once:!0}]} class="image" src=${E(o)} />`};import{html as w}from"https://cdn.skypack.dev/uhtml/async";function T(e,t,r=!1){var o;return function(){var a=this,s=arguments,n=function(){o=null,r||e.apply(a,s)},i=r&&!o;clearTimeout(o),o=setTimeout(n,t),i&&e.apply(a,s)}}var H=e=>e.split(/\/|#/).pop(),G=async e=>{if(e.target.value.length<4)return;let t=`
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
    `,r=`https://dbpedia.org/sparql?query=${encodeURIComponent(t)}&format=json`,a=await(await fetch(r,{method:"GET",headers:{Accept:"application/sparql-results+json"}})).json();u(a.results.bindings.map(s=>({label:s.label.value,image:s.image.value,id:H(s.uri.value)}))),c()},L=()=>w`
        <form class="search-form" onsubmit=${e=>e.preventDefault()}>
            <label>Please search for a person</label>
            <input onkeyup=${T(G,500)} type="search" class="search-input">

            ${h.map(e=>w`
                <a class="suggestion" href=${`/${e.id}`} onclick=${()=>u([])}>
                    ${d(e.image,e.label)}
                    <h3 class="title">${e.label}</h3>
                </div>
            `)}

        </form>
    `;var Q=(e,t)=>`
    PREFIX dbo: <http://dbpedia.org/ontology/>
    PREFIX dbr: <http://dbpedia.org/resource/>

    SELECT DISTINCT (REPLACE(STR(?person), "http://dbpedia.org/resource/", "") as ?id) ?label ?image
    WHERE {
        <http://dbpedia.org/resource/${e}> rdfs:label ?label .
        BIND (<http://dbpedia.org/resource/${e}> as ?person)
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
`,b=async e=>(e=e.replaceAll(`
`," "),await(await fetch(`https://dbpedia.org/sparql?default-graph-uri=http://dbpedia.org&query=${e}&format=application/json-ld`)).json()),g=(e,t=!1)=>{let r=e.head.vars,o=e.results.bindings.map(a=>{var n;let s={};for(let i of r)s[i]=(n=a[i])==null?void 0:n.value;return s});return t?o[0]:o},P=async(e,t="en")=>{let r=await b(Q(e,t));return g(r,!0)},A=async(e,t="en")=>{let r=await b(S(e,"person",t));return g(r)},R=async(e,t="en")=>{let r=await b(S(e,"others",t));return g(r)};var W={37:1,38:1,39:1,40:1};function l(e){e.preventDefault()}function C(e){if(W[e.keyCode])return l(e),!1}var j=!1;try{window.addEventListener("test",null,Object.defineProperty({},"passive",{get:function(){j=!0}}))}catch(e){}var m=j?{passive:!1}:!1,O="onwheel"in document.createElement("div")?"wheel":"mousewheel";function D(e){e.addEventListener("DOMMouseScroll",l,!1),e.addEventListener(O,l,m),e.addEventListener("touchmove",l,m),e.addEventListener("keydown",C,!1)}function k(e){e.removeEventListener("DOMMouseScroll",l,!1),e.removeEventListener(O,l,m),e.removeEventListener("touchmove",l,m),e.removeEventListener("keydown",C,!1)}document.body.addEventListener("click",e=>{let t=e.target.nodeName!=="A"?e.target.closest("a"):e.target;if(t){let r=t.getAttribute("href");r&&r[0]==="/"&&(e.preventDefault(),setTimeout(()=>{history.pushState(null,null,r),c()}))}});window.addEventListener("popstate",e=>{c()});var K=e=>{let t=location.pathname.substr(1).split(",");return t.splice(e),`/${t.join(",")}`},Z=(e,t)=>{let r=location.pathname.substr(1).split(",");return t<0?r=[e]:(r.splice(t),r[t]=e),`/${r.join(",")}`},Y=(e,t=0,r)=>{let o=x(e.id,r);return v`
        <div 
            class=${`person ${o?"active":""}`} 
            style=${`--index: ${t}`}
            data-id=${e.id}>
        
                ${d(e.image,e.label)}

                <h3 class="name">
                <span>
                    ${e.label}
                    </span>
                        <a class="action-button" href=${o?K(r):Z(e.id,r)}></a>        
                </h3>
        
        </div>
    `},F=()=>decodeURI(location.pathname).substr(1).split(",").filter(Boolean),x=(e,t)=>F()[t]===e,J=e=>{let t=e.target.querySelector(".inner");t.style=`--scroll: ${e.target.scrollTop}px; --half: ${e.target.clientHeight/2}px`},N=[],h=[],u=e=>{h=e},U=async(e,t,r)=>{let o=await t(e),a=o.some(s=>x(s.id,r));return v`
    <div ref=${s=>N.push(s)} onscroll=${J} style=${`--count: ${o.length}`} class=${`column ${a?"active":"is-loading"}`}>
        <div class="inner" style=${`--scroll: 0px; --half: ${Math.min(o.length*55+20,window.innerHeight)/2}px`}>
            ${o.map((s,n)=>Y(s,n,r))}
            <div class="scroll-maker"></div>
        </div>
    </div>
    `},V=async e=>{let t=await P(e[0]);return v`
        <div class="people">
            ${U(e[0],R,-1)}
            <div class="selected column">${Y(t,0,0)}</div>
            ${e.map((r,o)=>U(r,A,o+1))}
        </div>
    `},c=async()=>{let e=F();try{await z(document.body,e.length?V(e):L())}catch(t){console.info(t)}for(let[t,r]of N.entries())r.classList.contains("active")?D(r):k(r),setTimeout(()=>r.classList.remove("is-loading"),500)};setTimeout(()=>document.body.classList.remove("is-loading"),800);c();export{c as drawApp,h as suggestions,u as updateSuggestions};
//# sourceMappingURL=app.js.map
