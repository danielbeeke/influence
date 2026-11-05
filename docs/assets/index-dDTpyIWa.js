import{html as u,render as j}from"https://cdn.skypack.dev/uhtml@3.2.2/async";import fe from"https://cdn.skypack.dev/@jacobmarshall/kv";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))s(o);new MutationObserver(o=>{for(const r of o)if(r.type==="childList")for(const n of r.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&s(n)}).observe(document,{childList:!0,subtree:!0});function a(o){const r={};return o.integrity&&(r.integrity=o.integrity),o.referrerPolicy&&(r.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?r.credentials="include":o.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function s(o){if(o.ep)return;o.ep=!0;const r=a(o);fetch(o.href,r)}})();function B(e,t,a=!1){var s;return function(){var o=this,r=arguments,n=function(){s=null,a||e.apply(o,r)},l=a&&!s;clearTimeout(s),s=setTimeout(n,t),l&&e.apply(o,r)}}function we(e){for(var t=0,a=0;a<e.length;a++)t=e.charCodeAt(a)+((t<<5)-t);return t}function me(e){var t=(e&16777215).toString(16).toUpperCase();return"00000".substring(0,6-t.length)+t}const ge=e=>me(we(e)),R=[120,250,330,500,960,1280,1920],te=(e,t)=>{var s;if(!/commons\.wikimedia\.org\/wiki\/Special:FilePath\//.test(e))return e;const a=(s=R.find(o=>o>=t))!=null?s:R[R.length-1];return`${e.replace(/^http:/,"https:").split("?")[0]}?width=${a}`},be=(e,t=100,a=!1)=>`https://images.weserv.nl/?url=${encodeURIComponent(te(e,t*3))}&w=${t}${a?"":`&h=${t}&fit=cover&a=attention`}`,y=fe("thumbnailAlternative-v2"),H=e=>`wikipedia:${e}`,V=e=>`failed:${e}`,x=async(e,t,a=100,s=!1)=>{var h,f,S,Q,_;const o=(h=t==null?void 0:t.replace(/[^A-Z]/g,"").split("").map(v=>v.substr(0,1)))!=null?h:[],r=()=>u`<div class="image-alternative" style=${`--color: #${ge(t)}`}>
            <span>${o.join("")}</span>
        </div>`;let n=e;if(!n&&t&&(n=await y.get(H(t)),n===void 0)){const v=`https://en.wikipedia.org/w/api.php?action=query&origin=*&titles=${encodeURIComponent(t)}&prop=pageimages&format=json&pithumbsize=${a*3}`,I=await fetch(v).then(he=>he.json()).catch(()=>null),[A]=Object.values((S=(f=I==null?void 0:I.query)==null?void 0:f.pages)!=null?S:{});n=(_=(Q=A==null?void 0:A.thumbnail)==null?void 0:Q.source)!=null?_:!1,await y.set(H(t),n)}if(!n||await y.get(V(n)))return r();const l=be(n,a,s),i=te(n,a*3);let d=!1;return u`<img onerror=${[async v=>{if(!d){d=!0,v.target.src=i;return}await y.set(V(n),!0),p()},{once:!1}]} class="image" src=${l} />`},ve=e=>e.split(/\/|#/).pop(),ke=e=>{let t=localStorage.saved?JSON.parse(localStorage.saved):[];t=t.filter(a=>a!==e),localStorage.saved=JSON.stringify(t)},$e="https://query.wikidata.org/sparql",E=e=>/^Q\d+$/.test(e),L=e=>{if(!E(e))throw new Error(`Not a Wikidata id: ${e}`);return e},Se=e=>e.replace(/[\\"]/g,"\\$&").replace(/[\r\n]/g," "),ye=async e=>{var n,l;const t=e.filter(i=>!E(i));if(!t.length)return e;const a=`https://en.wikipedia.org/w/api.php?action=query&prop=pageprops&ppprop=wikibase_item&redirects=1&format=json&origin=*&titles=${encodeURIComponent(t.join("|"))}`,s=await fetch(a).then(i=>i.json()),o=i=>{var d,c;for(const h of["normalized","redirects"]){const f=((c=(d=s==null?void 0:s.query)==null?void 0:d[h])!=null?c:[]).find(S=>S.from===i);f&&(i=f.to)}return i},r=Object.values((l=(n=s==null?void 0:s.query)==null?void 0:n.pages)!=null?l:{});return e.map(i=>{var c,h;if(E(i))return i;const d=o(i.replace(/_/g," "));return(h=(c=r.find(f=>f.title===d))==null?void 0:c.pageprops)==null?void 0:h.wikibase_item}).filter(Boolean)},Pe=e=>e==="person"?"^wdt:P737":"wdt:P737",Ee=(e,t)=>`
    PREFIX wd: <http://www.wikidata.org/entity/>
    PREFIX wdt: <http://www.wikidata.org/prop/direct/>
    PREFIX schema: <http://schema.org/>
    PREFIX wikibase: <http://wikiba.se/ontology#>
    PREFIX bd: <http://www.bigdata.com/rdf#>

    SELECT
      (REPLACE(STR(?person), "http://www.wikidata.org/entity/", "") AS ?id)
      ?personLabel
      (SAMPLE(STR(?imageUrl)) AS ?image)
      (SAMPLE(?abstract) AS ?abstract)
      (SAMPLE(?wikipediaTitle) AS ?wikipediaTitle)
      (SAMPLE(STR(YEAR(?birthDate))) AS ?birth)
      (SAMPLE(STR(YEAR(?deathDate))) AS ?death)
      (COUNT(DISTINCT ?influenced) AS ?influence)
      (SAMPLE(?isHuman) AS ?isPerson)
    WHERE {
      BIND(wd:${L(e)} AS ?person)
      BIND(EXISTS { ?person wdt:P31 wd:Q5 } AS ?isHuman)

      OPTIONAL { ?person schema:description ?abstract . FILTER(lang(?abstract) = '${t}') }
      OPTIONAL {
        ?article schema:about ?person ;
                 schema:isPartOf <https://${t}.wikipedia.org/> ;
                 schema:name ?wikipediaTitle .
      }
      OPTIONAL { ?person wdt:P569 ?birthDate }
      OPTIONAL { ?person wdt:P570 ?deathDate }
      OPTIONAL { ?person wdt:P18 ?imageUrl }
      OPTIONAL { ?person ^wdt:P737 ?influenced }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "${t},en". }
    }
    GROUP BY ?person ?personLabel
`,ae=(e,t,a)=>`
    PREFIX wd: <http://www.wikidata.org/entity/>
    PREFIX wdt: <http://www.wikidata.org/prop/direct/>
    PREFIX schema: <http://schema.org/>

    SELECT DISTINCT
      (SAMPLE(?abstractVal) AS ?abstract)
      ?label
      (SAMPLE(STR(?imageUrl)) AS ?image)
      (REPLACE(STR(?item), "http://www.wikidata.org/entity/", "") AS ?id)
    WHERE {
      wd:${L(e)} ${a} ?item .
      ?item rdfs:label ?label .
      OPTIONAL { ?item schema:description ?abstractVal . FILTER(lang(?abstractVal) = '${t}') }
      OPTIONAL { ?item wdt:P18 ?imageUrl }
      FILTER(lang(?label) = '${t}')
    }
    GROUP BY ?item ?label
`,Te=(e,t)=>ae(e,t,"wdt:P101"),Le=(e,t)=>ae(e,t,"wdt:P800"),Ie=(e,t)=>`
    PREFIX wd: <http://www.wikidata.org/entity/>
    PREFIX wdt: <http://www.wikidata.org/prop/direct/>
    PREFIX schema: <http://schema.org/>

    SELECT DISTINCT
      (SAMPLE(?abstractVal) AS ?abstract)
      ?label
      (MIN(STR(?pubDate)) AS ?date)
      (SAMPLE(STR(?imageUrl)) AS ?image)
      (REPLACE(STR(?work), "http://www.wikidata.org/entity/", "") AS ?id)
    WHERE {
      ?work wdt:P50 wd:${L(e)} .
      ?work rdfs:label ?label .
      OPTIONAL { ?work schema:description ?abstractVal . FILTER(lang(?abstractVal) = '${t}') }
      OPTIONAL { ?work wdt:P577 ?pubDate }
      OPTIONAL { ?work wdt:P18 ?imageUrl }
      FILTER(lang(?label) = '${t}')
    }
    GROUP BY ?work ?label
    ORDER BY ASC(?date)
`,Ae=e=>`
    PREFIX wikibase: <http://wikiba.se/ontology#>
    PREFIX bd: <http://www.bigdata.com/rdf#>
    PREFIX mwapi: <https://www.mediawiki.org/ontology#API/>
    PREFIX wd: <http://www.wikidata.org/entity/>
    PREFIX wdt: <http://www.wikidata.org/prop/direct/>

    # Like the old DBpedia search: only humans, the most influential first.
    SELECT ?uri ?uriLabel (SAMPLE(STR(?imageUrl)) AS ?image) (MIN(?num) AS ?ordinal) (COUNT(DISTINCT ?influenced) AS ?influence) WHERE {
      SERVICE wikibase:mwapi {
        bd:serviceParam wikibase:api "EntitySearch" .
        bd:serviceParam wikibase:endpoint "www.wikidata.org" .
        bd:serviceParam mwapi:search "${Se(e)}" .
        bd:serviceParam mwapi:language "en" .
        bd:serviceParam wikibase:limit 100 .
        ?uri wikibase:apiOutputItem mwapi:item .
        ?num wikibase:apiOrdinal true .
      }
      ?uri wdt:P31 wd:Q5 .
      OPTIONAL { ?uri wdt:P18 ?imageUrl }
      OPTIONAL { ?uri ^wdt:P737 ?influenced }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }
    GROUP BY ?uri ?uriLabel
    ORDER BY DESC(?influence) ASC(?ordinal)
    LIMIT 20
`,se=(e,t,a)=>`
    PREFIX wd: <http://www.wikidata.org/entity/>
    PREFIX wdt: <http://www.wikidata.org/prop/direct/>
    PREFIX wikibase: <http://wikiba.se/ontology#>
    PREFIX bd: <http://www.bigdata.com/rdf#>

    SELECT
      (REPLACE(STR(?person), "http://www.wikidata.org/entity/", "") AS ?id)
      ?personLabel
      (SAMPLE(STR(?imageUrl)) AS ?image)
      (SAMPLE(STR(YEAR(?birthDate))) AS ?birth)
      (SAMPLE(STR(YEAR(?deathDate))) AS ?death)
      (COUNT(DISTINCT ?influenced) AS ?influence)
    WHERE {
      { SELECT DISTINCT ?person { wd:${L(e)} ${Pe(t)} ?person . } }

      OPTIONAL { ?person wdt:P18 ?imageUrl }
      OPTIONAL { ?person wdt:P569 ?birthDate }
      OPTIONAL { ?person wdt:P570 ?deathDate }
      OPTIONAL { ?person ^wdt:P737 ?influenced }

      FILTER isIRI(?person)
      SERVICE wikibase:label { bd:serviceParam wikibase:language "${a},en". }
    }
    GROUP BY ?person ?personLabel
    ORDER BY DESC(?influence)
    LIMIT 1000
`,O=new Map,w=e=>{let t=O.get(e);return t||(t=fetch(`${$e}?query=${encodeURIComponent(e)}&format=json`,{headers:{Accept:"application/sparql-results+json"}}).then(async a=>{if(!a.ok)throw new Error(`Wikidata query failed (${a.status}): ${(await a.text()).slice(0,200)}`);return a.json()}).catch(a=>{throw O.delete(e),a}),O.set(e,t)),t},m=(e,t=!1,a)=>{const s=e.head.vars,o=e.results.bindings.map(r=>{var l;const n={};for(const i of s){const d=i===a?"label":i;n[d]=(l=r[i])==null?void 0:l.value}return n});return t?o[0]:o},C=new Map,Re=async(e,t)=>{var i,d,c;const a=`${t}:${e}`;if(C.has(a))return C.get(a);const s=`https://${t}.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&redirects=1&format=json&origin=*&titles=${encodeURIComponent(e)}`,r=await(await fetch(s)).json(),[n]=Object.values((d=(i=r==null?void 0:r.query)==null?void 0:i.pages)!=null?d:{}),l=(c=n==null?void 0:n.extract)!=null?c:"";return C.set(a,l),l},K=async(e,t="en",a=!1)=>{const s=await w(Ee(e,t)),o=m(s,!0,"personLabel");if(a&&o.wikipediaTitle){const r=await Re(o.wikipediaTitle,t);r&&(o.abstract=r)}return o},G=async(e,t="en")=>{const a=await w(se(e,"person",t));return m(a,!1,"personLabel")},J=async(e,t="en")=>{const a=await w(se(e,"others",t));return m(a,!1,"personLabel")},Oe=async(e,t="en")=>{const a=await w(Ie(e,t));return m(a)},Ce=async(e,t="en")=>{const a=await w(Te(e,t));return m(a)},Ne=async(e,t="en")=>{const a=await w(Le(e,t));return m(a)},De=async e=>{const t=await w(Ae(e));return m(t,!1,"uriLabel")},Me=async e=>{if(e.target.value.length<4)return;U=!0,p();const t=await De(e.target.value);console.log(t),oe(t.map(a=>({label:a.label,image:a.image,id:ve(a.uri)}))),U=!1,p()};let F=[];const oe=e=>{F=e};let U=!1;const Fe=()=>{const e=localStorage.saved?JSON.parse(localStorage.saved):[];return u`


        <form class=${`search-form ${U?"is-searching":""}`} onsubmit=${t=>t.preventDefault()}>
        <header class="site-header">
            <img class="site-logo" src="/logo.svg" />
            <h1 class="site-title">Influence</h1>
        </header>

        <h3 class="title">Search for a philosopher or an influential thinker</h3>
            <div class="search-field-wrapper">
            <img class="search-icon" src="/zoom.svg" />
            <input onkeyup=${B(Me,500)} type="search" class="search-input">
            <img class="search-loading-icon" src="/loading.svg" />
            </div>

            ${F.map(t=>u`
                <a class="suggestion" href=${`/${t.id}`} onclick=${()=>oe([])}>
                    ${x(t.image,t.label)}
                    <h3 class="title">${t.label}</h3>
                </div>
            `)}

            ${F.length?null:u`
            <div class="hint">
            You can try <a href="/Q6512">Søren Kierkegaard</a> or <a href="/Q859">Plato</a>
            </div>
            `}

            ${e.length?u`
                <div class="saved-bookmarks">
                    <h3 class="title"><img src="/bookmarks.svg"> Your bookmarks</h3>

                    <ul class="bookmark-list">
                    ${e.map(t=>{const a=t.substr(1).split(",").map(o=>decodeURI(o).replace(/_/g," ")),s=`${a[0]} > ${a[a.length-1]} (${a.length})`;return u`
                        <li>
                            <a class="bookmark" href=${t}>${s}</a>
                            <img class="remove-bookmark" onclick=${()=>{ke(t),p()}} src="/delete.svg" />
                        </li>
                        `})}

                    </ul>
                </div>
            `:null}

        </form>
    `};function Ue(e,t,a={leading:!0,trailing:!0}){var s,o,r,n=null,l=0,i=function(){l=a.leading===!1?0:Date.now(),n=null,r=e.apply(s,o),n||(s=o=null)};return function(){var d=Date.now();!l&&a.leading===!1&&(l=d);var c=t-(d-l);return s=this,o=arguments,c<=0||c>t?(n&&(clearTimeout(n),n=null),l=d,r=e.apply(s,o),n||(s=o=null)):!n&&a.trailing!==!1&&(n=setTimeout(i,c)),r}}const Y=()=>decodeURI(location.pathname).substr(1).split(",").filter(Boolean),ne=(e,t)=>Y()[t]===e,Xe=e=>{let t=location.pathname.substr(1).split(",");return t.splice(e),`/${t.join(",")}`},Be=(e,t)=>{let a=location.pathname.substr(1).split(",");return t<0?a=[e]:(a.splice(t),a[t]=e),`/${a.join(",")}`},xe=(e,t=0,a)=>{const s=ne(e.id,a),o=X.indexOf(parseInt(e.influence)),r=Math.round(100/X.length*o);return u`
        <div 
            class=${`person ${s?"active":""}`} 
            style=${`--index: ${t}`}
            data-id=${e.id}>
        
                <button class="expand-button" onclick=${()=>{location.hash=e.id,p()}}>
                    ${x(e.image,e.label)}
                    <img class="loading-icon" src="/loading.svg" />
                </button>

                <a class="name" href=${s?Xe(a):Be(e.id,a)}>
                    ${e.birth?u`<span class="dates">${e.birth.substr(0,4)} ${e.death?u` / ${e.death.substr(0,4)}`:null}</span>`:null}
                    <span class="text">${e.label}</span>
                    ${r?u`<div class="progress-bar" style=${`--percentage: ${r}`}></div>`:null}
                </a>

                <span class="action-button"></span>
        
        </div>
    `},N=e=>{var s,o;const t=(o=(s=e==null?void 0:e.match(/\d{4}/g))==null?void 0:s.map(r=>parseInt(r)))!=null?o:[],a=Math.min(...t);return a!==1/0?a:null},P=new Map,re=(e,t)=>(P.has(e)||P.set(e,t))&&P.get(e);var Ye={37:1,38:1,39:1,40:1};const ie=e=>t=>{if(!e){t.preventDefault();return}const a=Math.abs(t.touches[0].clientX-t.target._startTouch.x),s=Math.abs(t.touches[0].clientY-t.target._startTouch.y);(e==="y"&&a<s*3||e==="x"&&s<a*3)&&t.cancelable&&t.preventDefault()},le=ie("y"),k=ie(null);function ce(e){e.target._startTouch={x:e.touches[0].clientX,y:e.touches[0].clientY}}function ue(e){if(Ye[e.keyCode])return k(e),!1}var de=!1;try{window.addEventListener("test",null,Object.defineProperty({},"passive",{get:function(){de=!0}}))}catch(e){}var g=de?{passive:!1}:!1,pe="onwheel"in document.createElement("div")?"wheel":"mousewheel";function We(e,t){e.addEventListener("DOMMouseScroll",k,!1),e.addEventListener(pe,k,g),e.addEventListener("touchmove",le,g),e.addEventListener("touchstart",ce,g),e.addEventListener("keydown",ue,!1)}function qe(e,t){e.removeEventListener("DOMMouseScroll",k,!1),e.removeEventListener(pe,k,g),e.removeEventListener("touchmove",le,g),e.removeEventListener("touchstart",ce,g),e.removeEventListener("keydown",ue,!1)}function Z(e=window){let t=0,a=e===window?window.scrollY:e.scrollTop,s=e===window?window.scrollX:e.scrollLeft;return new Promise(o=>{function r(n){const l=e===window?window.scrollY:e.scrollTop,i=e===window?window.scrollX:e.scrollLeft;n>=500||n-t>20?o(null):((i!=a||l!=s)&&(t=n,a=i,s=l),requestAnimationFrame(r.bind(null,n+1)))}r(0)})}let D=!1;const Qe=new Date().getTime(),$=async(e=!1)=>{const t=[...document.querySelectorAll(".column")];if(!t.length)return;const a=[],s=new Date().getTime()-Qe;for(const o of t){const r=o.querySelector(".person.active");if(r){const n=r.offsetTop-20,l=o.querySelector(".inner");let i=s<2e3?"auto":"smooth";e&&(i="auto"),l.scrollTo({top:n,behavior:i}),a.push(Z(l).then(()=>{o.classList.remove("is-loading"),We(o.querySelector(".inner"))}))}else qe(o.querySelector(".inner")),o.classList.remove("is-loading")}await Promise.all(a),D||(D=!0,document.body.scrollTo({left:document.body.scrollWidth,behavior:s<2e3?"auto":"smooth"}),Z(document.body).then(()=>{D=!1}))};function _e(e,t,a){return a.indexOf(e)===t}const je=[],He=async e=>{const t=await Ne(e.id);return t.length?u`
    <ul class="ideas item-list">
        <h3>Ideas:</h3>
        ${t.map(a=>u`<li><a class="idea item" href=${`#${a.id}`}>${a.label}</a></li>`)}
    </ul>
    `:null},Ve=async e=>{const t=await Oe(e.id);for(const a of t)a.cleanedDate=N(a.date);return t.sort((a,s)=>a.cleanedDate-s.cleanedDate),t.length?u`
    <ul class="works item-list">
        <h3>Works:</h3>
        ${t.map(a=>u`<li><a class="work item" href=${`#${a.id}`}>${a.label} ${N(a.date)?u`(${N(a.date)})`:null}</a></li>`)}
    </ul>
    `:null},Ke=async e=>{const t=await Ce(e.id);return t.length?u`
    <ul class="interests item-list">
        <h3>Interests:</h3>
        ${t.map(a=>u`<li><a class="interest item" href=${`#${a.id}`}>${a.label}</a></li>`)}
    </ul>
    `:null};let b="";const Ge=async()=>{let e=localStorage.saved?JSON.parse(localStorage.saved):[];(e.includes(location.pathname)?"bookmarked":"default")==="bookmarked"?(e=e.filter(a=>a!==location.pathname),b="bookmark-removed"):(e.push(location.pathname),b="bookmark-added"),localStorage.saved=JSON.stringify(e),await p(),setTimeout(()=>{b=e.includes(location.pathname)?"bookmarked":"default",p()},1500)},z=new Map;let X=[];const Je=async(e,t=!1)=>{const a=await Promise.all(e.map(n=>K(n))),s=re(location.hash,{popup:null});let o="";if(location.hash){const n=decodeURI(location.hash).substr(1);n==="info"?s.popup={label:"About this app",abstract:`The purple bars show the relative influence compared to all the others currently shown in the app.
                
                Click on the photos of the people to see a popup with more information. Click on the names to expand and see the influence of that person.`}:n&&(s.popup||setTimeout(()=>{K(n,"en",!0).then(l=>{var d,c;s.popup=l,o=(c=(d=s==null?void 0:s.popup)==null?void 0:d.abstract)!=null?c:"";const i=o.match(/(\.)[^ "]/g);if(i)for(const h of i)o=o.replace(h,`.

`+h.substr(1));s.popup&&(s.popup.abstract=o),p()})},100))}document.body.dataset.selectedPerson=(!!location.hash).toString(),b.includes("-")||(b=(localStorage.saved?JSON.parse(localStorage.saved):[]).includes(location.pathname)?"bookmarked":"default");const r=location.pathname;return z.has(r)||Promise.all([J(e[0]),Promise.resolve([a[0]]),...e.map(n=>G(n))]).then(n=>{X=n.flatMap(l=>l.map(i=>parseInt(i.influence))).sort((l,i)=>l-i).filter(_e),z.set(r,!0),p()}),u`
        ${location.hash?u`
        <div class="selected-person">
            ${s.popup?u`
            <h1 class="title">${s.popup.label} <button class="close" onclick=${()=>{location.hash="",p()}}></button></h1>
            <div class="abstract">
                ${x(s.popup.image,s.popup.label,300,!0)}
                <p ref=${n=>n.innerText=s.popup.abstract}></p>
                ${s.popup.isPerson==="true"?u`<a href=${`/${s.popup.id}`}>Start with ${s.popup.label}</a>`:null}
                
            </div>

            `:null}
        </div>        
        ${s.popup?null:u`<img class="popup-loading" src="/loading.svg" />`}
        `:null}

        <div class="people">
            ${M(e[0],J,-1,`Influencers of ${a[0].label}`)}
            ${M(e[0],async()=>[a[0]],0,"Your starting selection:")}
            ${e.map((n,l)=>M(n,G,l+1,`Influenced by ${a[l].label}`))}
        </div>

        <div class="fixed-menu">
            <a class="fixed-button info-button" href="#info">
                <div class="icon"></div>
            </a>

            <a class="fixed-button restart-button" href="/">
                <div class="icon"></div>
            </a>

            <button data-state=${b} class="fixed-button bookmark-button" onclick=${Ge}>
                <span class="text removed">Bookmark removed</span>
                <span class="text added">Bookmark added</span>
                <div class="icon"></div>
            </button>        
        </div>

    `},W=new Map,Ze=async(e,t)=>{W.set(e,!0),await p(),t.focus()},q=(e,t=null)=>{W.set(e,!1),T.set(e,""),t&&(t.value=""),p()},T=new Map,ze=B((e,t)=>{T.set(t,e.target.value),p()},100),et=(e,t)=>{e.target.value||q(t)},M=async(e,t,a,s)=>{var i,d;const o=re(e+":"+a,{people:[],isLoading:!0});o.isLoading&&t(e).then(c=>{o.people=c,o.isLoading=!1,p().then($)});const r=o.people.find(c=>ne(c.id,a));let n;const l=(i=T.get(a))==null?void 0:i.toLowerCase();return u`
    <div ref=${c=>je.push(c)} class=${`column is-loading ${a===0?"selected":""} ${r?"active":""}`}>
        <h3 class=${`column-title ${W.get(a)?"active-search":""}`}>
            ${s}
            <input .value=${(d=T.get(a))!=null?d:""} placeholder="Filter" onblur=${c=>et(c,a)} onkeyup=${c=>ze(c,a)} ref=${c=>n=c} type="search" class="search-field">
            <button onclick=${()=>Ze(a,n)} class="do-search-icon"></button>
            <button onclick=${()=>q(a,n)} class="close-search-icon"></button>
        </h3>

        <div class="inner">
            ${o.people.filter(c=>l?c.label.toLowerCase().includes(l):!0).map((c,h)=>xe(c,h,a))}

            <div class="scroll-maker"></div>
        </div>

        ${r?u`
        <div class="item-lists scroll-box">
            ${Ve(r)}
            ${Ke(r)}
            ${He(r)}
        </div>
        `:null}

    </div>
    `};document.body.addEventListener("click",e=>{var a,s;const t=e.target.nodeName!=="A"?e.target.closest("a"):e.target;if(t){const o=t.getAttribute("href");if(o&&o[0]==="/"){e.preventDefault();const r=(a=t.closest(".person"))==null?void 0:a.classList.contains("active"),n=(s=t.closest(".person"))==null?void 0:s.classList.contains("person");n&&!r?(t.closest(".person").classList.add("loading"),setTimeout($,400)):n&&r&&t.closest(".person").classList.add("is-closing");const l=[...document.querySelectorAll(".column")];if(n&&r){const i=l.indexOf(t.closest(".column"));if(i===1)history.pushState(null,null,o),p();else for(const[d,c]of l.entries())d>i&&(c.addEventListener("animationend",async()=>{history.pushState(null,null,o),await p(),q(d-1),$(),document.body.classList.remove("prepare-removal-column")},{once:!0}),c.classList.add("prepare-removal"),document.body.classList.add("prepare-removal-column"))}else history.pushState(null,null,o),p()}}});"serviceWorker"in navigator&&navigator.serviceWorker.register("./sw.js",{scope:"/"}).then(e=>{console.log("Registration succeeded. Scope is "+e.scope)}).catch(e=>{console.log("Registration failed with "+e)});const tt=B($,700);let ee="";const at={columns:()=>{const e=Y();return Je(e)},search:()=>Fe()},p=Ue(async()=>{let e=Y();e.some(a=>!E(a))&&(e=await ye(e),history.replaceState(history.state,"",`/${e.join(",")}${location.hash}`));const t=e.length?"columns":"search";try{await j(document.body,at[t]()),ee!==t&&setTimeout(()=>{$(!0)},700),ee=t}catch(a){a.message==="NetworkError when attempting to fetch resource."?j(document.body,u`<h1 class="dbpedia-offline">Unfortunatly Wikidata is down.<br>Please come back later.</h1>`):console.info(a)}},300);p().then(tt);window.addEventListener("popstate",p);
//# sourceMappingURL=index-dDTpyIWa.js.map
