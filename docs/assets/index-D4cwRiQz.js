import{html as u,render as K}from"https://cdn.skypack.dev/uhtml@3.2.2/async";import $e from"https://cdn.skypack.dev/@jacobmarshall/kv";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const r of n)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&a(o)}).observe(document,{childList:!0,subtree:!0});function s(n){const r={};return n.integrity&&(r.integrity=n.integrity),n.referrerPolicy&&(r.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?r.credentials="include":n.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function a(n){if(n.ep)return;n.ep=!0;const r=s(n);fetch(n.href,r)}})();function q(e,t,s=!1){var a;return function(){var n=this,r=arguments,o=function(){a=null,s||e.apply(n,r)},i=s&&!a;clearTimeout(a),a=setTimeout(o,t),i&&e.apply(n,r)}}function ye(e){for(var t=0,s=0;s<e.length;s++)t=e.charCodeAt(s)+((t<<5)-t);return t}function Se(e){var t=(e&16777215).toString(16).toUpperCase();return"00000".substring(0,6-t.length)+t}const ke=e=>Se(ye(e)),A=[120,250,330,500,960,1280,1920],re=(e,t)=>{var a;if(!/commons\.wikimedia\.org\/wiki\/Special:FilePath\//.test(e))return e;const s=(a=A.find(n=>n>=t))!=null?a:A[A.length-1];return`${e.replace(/^http:/,"https:").split("?")[0]}?width=${s}`},Ee=(e,t=100,s=!1)=>`https://images.weserv.nl/?url=${encodeURIComponent(re(e,t*3))}&w=${t}${s?"":`&h=${t}&fit=cover&a=attention`}`,S=$e("thumbnailAlternative-v2"),V=e=>`wikipedia:${e}`,Z=e=>`failed:${e}`,x=async(e,t,s=100,a=!1)=>{var h,y,H,J,G;const n=(h=t==null?void 0:t.replace(/[^A-Z]/g,"").split("").map(w=>w.substr(0,1)))!=null?h:[],r=()=>u`<div class="image-alternative" style=${`--color: #${ke(t)}`}>
            <span>${n.join("")}</span>
        </div>`;let o=e;if(!o&&t&&(o=await S.get(V(t)),o===void 0)){const w=`https://en.wikipedia.org/w/api.php?action=query&origin=*&titles=${encodeURIComponent(t)}&prop=pageimages&format=json&pithumbsize=${s*3}`,L=await fetch(w).then(be=>be.json()).catch(()=>null),[T]=Object.values((H=(y=L==null?void 0:L.query)==null?void 0:y.pages)!=null?H:{});o=(G=(J=T==null?void 0:T.thumbnail)==null?void 0:J.source)!=null?G:!1,await S.set(V(t),o)}if(!o||await S.get(Z(o)))return r();const i=Ee(o,s,a),l=re(o,s*3);let d=!1;return u`<img onerror=${[async w=>{if(!d){d=!0,w.target.src=l;return}await S.set(Z(o),!0),p()},{once:!1}]} class="image" src=${i} />`},Pe=e=>e.split(/\/|#/).pop(),Le=e=>{let t=localStorage.saved?JSON.parse(localStorage.saved):[];t=t.filter(s=>s!==e),localStorage.saved=JSON.stringify(t)},Te="https://query.wikidata.org/sparql",Ae=`
    PREFIX wd: <http://www.wikidata.org/entity/>
    PREFIX wdt: <http://www.wikidata.org/prop/direct/>
    PREFIX schema: <http://schema.org/>
    PREFIX wikibase: <http://wikiba.se/ontology#>
    PREFIX bd: <http://www.bigdata.com/rdf#>
    PREFIX mwapi: <https://www.mediawiki.org/ontology#API/>
`,F=e=>`REPLACE(STR(${e}), "http://www.wikidata.org/entity/", "")`,E=e=>/^Q\d+$/.test(e),_=e=>{if(!E(e))throw new Error(`Not an entity id: ${e}`);return e},Ie=e=>e.replace(/[\\"]/g,"\\$&").replace(/[\r\n]/g," "),Oe="influence-data-v1",ie="x-cached-at",Re=24*60*60*1e3,Ne=4;let I=0;const z=[],De=async e=>{var t;I>=Ne&&await new Promise(s=>z.push(s)),I++;try{return await e()}finally{I--,(t=z.shift())==null||t()}},le=async()=>{try{return"caches"in globalThis?await caches.open(Oe):null}catch(e){return null}},C=async(e,t,s=!1)=>{var o;const a=await(t?De(()=>fetch(e,{headers:{Accept:"application/sparql-results+json"}})):fetch(e));if(a.status===429&&!s){const i=Math.min(parseInt((o=a.headers.get("retry-after"))!=null?o:"")||2,10);return await new Promise(l=>setTimeout(l,i*1e3)),C(e,t,!0)}if(!a.ok)throw new Error(`Data request failed (${a.status}): ${(await a.text()).slice(0,200)}`);const n=await a.json(),r=await le();return r==null||r.put(e,new Response(JSON.stringify(n),{headers:{"content-type":"application/json",[ie]:Date.now().toString()}})).catch(()=>{}),n},O=new Map,Y=(e,t=!1)=>{let s=O.get(e);return s||(s=(async()=>{var n,r;const a=await((n=await le())==null?void 0:n.match(e).catch(()=>{}));return a?(Date.now()-parseInt((r=a.headers.get(ie))!=null?r:"0")>Re&&C(e,t).catch(()=>{}),a.json()):C(e,t)})().catch(a=>{throw O.delete(e),a}),O.set(e,s)),s},b=e=>Y(`${Te}?query=${encodeURIComponent(Ae+e)}&format=json`,!0),$=(e,t=!1,s)=>{const a=e.head.vars,n=e.results.bindings.map(r=>{var i;const o={};for(const l of a){const d=l===s?"label":l;o[d]=(i=r[l])==null?void 0:i.value}return o});return t?n[0]:n},Ce=(e,t)=>`
    SELECT
      (${F("?person")} AS ?id)
      ?personLabel
      (SAMPLE(STR(?imageUrl)) AS ?image)
      (SAMPLE(?abstract) AS ?abstract)
      (SAMPLE(?wikipediaTitle) AS ?wikipediaTitle)
      (SAMPLE(STR(YEAR(?birthDate))) AS ?birth)
      (SAMPLE(STR(YEAR(?deathDate))) AS ?death)
      (COUNT(DISTINCT ?influenced) AS ?influence)
      (SAMPLE(?isHuman) AS ?isPerson)
    WHERE {
      BIND(wd:${_(e)} AS ?person)
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
`,Me=e=>e==="person"?"^wdt:P737":"wdt:P737",ce=(e,t,s)=>`
    SELECT
      (${F("?person")} AS ?id)
      ?personLabel
      (SAMPLE(STR(?imageUrl)) AS ?image)
      (SAMPLE(STR(YEAR(?birthDate))) AS ?birth)
      (SAMPLE(STR(YEAR(?deathDate))) AS ?death)
      (COUNT(DISTINCT ?influenced) AS ?influence)
    WHERE {
      { SELECT DISTINCT ?person { wd:${_(e)} ${Me(t)} ?person . } }

      OPTIONAL { ?person wdt:P18 ?imageUrl }
      OPTIONAL { ?person wdt:P569 ?birthDate }
      OPTIONAL { ?person wdt:P570 ?deathDate }
      OPTIONAL { ?person ^wdt:P737 ?influenced }

      FILTER isIRI(?person)
      SERVICE wikibase:label { bd:serviceParam wikibase:language "${s},en". }
    }
    GROUP BY ?person ?personLabel
    ORDER BY DESC(?influence)
    LIMIT 1000
`,Ue=(e,t)=>{const s=`?item rdfs:label ?label . FILTER(lang(?label) = '${t}')`;return`
    SELECT ?kind (${F("?item")} AS ?id) ?label (MIN(STR(?pubDate)) AS ?date)
    WHERE {
      { ?item wdt:P50 wd:${_(e)} . ${s} OPTIONAL { ?item wdt:P577 ?pubDate } BIND("works" AS ?kind) }
      UNION { wd:${e} wdt:P101 ?item . ${s} BIND("interests" AS ?kind) }
      UNION { wd:${e} wdt:P800 ?item . ${s} BIND("ideas" AS ?kind) }
    }
    GROUP BY ?kind ?item ?label
`},Be=e=>`
    # Only humans, the most influential first.
    SELECT ?uri ?uriLabel (SAMPLE(STR(?imageUrl)) AS ?image) (MIN(?num) AS ?ordinal) (COUNT(DISTINCT ?influenced) AS ?influence) WHERE {
      SERVICE wikibase:mwapi {
        bd:serviceParam wikibase:api "EntitySearch" .
        bd:serviceParam wikibase:endpoint "www.wikidata.org" .
        bd:serviceParam mwapi:search "${Ie(e)}" .
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
`,qe=async e=>{var r,o;const t=e.filter(i=>!E(i));if(!t.length)return e;const s=await Y(`https://en.wikipedia.org/w/api.php?action=query&prop=pageprops&ppprop=wikibase_item&redirects=1&format=json&origin=*&titles=${encodeURIComponent(t.join("|"))}`),a=i=>{var l,d;for(const c of["normalized","redirects"]){const h=((d=(l=s==null?void 0:s.query)==null?void 0:l[c])!=null?d:[]).find(y=>y.from===i);h&&(i=h.to)}return i},n=Object.values((o=(r=s==null?void 0:s.query)==null?void 0:r.pages)!=null?o:{});return e.map(i=>{var d,c;if(E(i))return i;const l=a(i.replace(/_/g," "));return(c=(d=n.find(h=>h.title===l))==null?void 0:d.pageprops)==null?void 0:c.wikibase_item}).filter(Boolean)},xe=async(e,t)=>{var n,r,o;const s=await Y(`https://${t}.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&redirects=1&format=json&origin=*&titles=${encodeURIComponent(e)}`),[a]=Object.values((r=(n=s==null?void 0:s.query)==null?void 0:n.pages)!=null?r:{});return(o=a==null?void 0:a.extract)!=null?o:""},ee=async(e,t="en",s=!1)=>{const a=await b(Ce(e,t)),n=$(a,!0,"personLabel");if(s&&n.wikipediaTitle){const r=await xe(n.wikipediaTitle,t).catch(()=>"");r&&(n.abstract=r)}return n},te=async(e,t="en")=>{const s=await b(ce(e,"person",t));return $(s,!1,"personLabel")},se=async(e,t="en")=>{const s=await b(ce(e,"others",t));return $(s,!1,"personLabel")},Q=async(e,t)=>{var n;const s=await b(Ue(e,t)),a={works:[],interests:[],ideas:[]};for(const{kind:r,...o}of $(s))(n=a[r])==null||n.push(o);return a},Fe=async(e,t="en")=>(await Q(e,t)).works,_e=async(e,t="en")=>(await Q(e,t)).interests,Ye=async(e,t="en")=>(await Q(e,t)).ideas,Qe=async e=>{const t=await b(Be(e));return $(t,!1,"uriLabel")},We=async e=>{if(e.target.value.length<4)return;U=!0,p();const t=await Qe(e.target.value);console.log(t),ue(t.map(s=>({label:s.label,image:s.image,id:Pe(s.uri)}))),U=!1,p()};let M=[];const ue=e=>{M=e};let U=!1;const Xe=()=>{const e=localStorage.saved?JSON.parse(localStorage.saved):[];return u`


        <form class=${`search-form ${U?"is-searching":""}`} onsubmit=${t=>t.preventDefault()}>
        <header class="site-header">
            <img class="site-logo" src="/logo.svg" />
            <h1 class="site-title">Influence</h1>
        </header>

        <h3 class="title">Search for a philosopher or an influential thinker</h3>
            <div class="search-field-wrapper">
            <img class="search-icon" src="/zoom.svg" />
            <input onkeyup=${q(We,500)} type="search" class="search-input">
            <img class="search-loading-icon" src="/loading.svg" />
            </div>

            ${M.map(t=>u`
                <a class="suggestion" href=${`/${t.id}`} onclick=${()=>ue([])}>
                    ${x(t.image,t.label)}
                    <h3 class="title">${t.label}</h3>
                </div>
            `)}

            ${M.length?null:u`
            <div class="hint">
            You can try <a href="/Q6512">Søren Kierkegaard</a> or <a href="/Q859">Plato</a>
            </div>
            `}

            ${e.length?u`
                <div class="saved-bookmarks">
                    <h3 class="title"><img src="/bookmarks.svg"> Your bookmarks</h3>

                    <ul class="bookmark-list">
                    ${e.map(t=>{const s=t.substr(1).split(",").map(n=>decodeURI(n).replace(/_/g," ")),a=`${s[0]} > ${s[s.length-1]} (${s.length})`;return u`
                        <li>
                            <a class="bookmark" href=${t}>${a}</a>
                            <img class="remove-bookmark" onclick=${()=>{Le(t),p()}} src="/delete.svg" />
                        </li>
                        `})}

                    </ul>
                </div>
            `:null}

        </form>
    `};function je(e,t,s={leading:!0,trailing:!0}){var a,n,r,o=null,i=0,l=function(){i=s.leading===!1?0:Date.now(),o=null,r=e.apply(a,n),o||(a=n=null)};return function(){var d=Date.now();!i&&s.leading===!1&&(i=d);var c=t-(d-i);return a=this,n=arguments,c<=0||c>t?(o&&(clearTimeout(o),o=null),i=d,r=e.apply(a,n),o||(a=n=null)):!o&&s.trailing!==!1&&(o=setTimeout(l,c)),r}}const W=()=>decodeURI(location.pathname).substr(1).split(",").filter(Boolean),de=(e,t)=>W()[t]===e,He=e=>{let t=location.pathname.substr(1).split(",");return t.splice(e),`/${t.join(",")}`},Je=(e,t)=>{let s=location.pathname.substr(1).split(",");return t<0?s=[e]:(s.splice(t),s[t]=e),`/${s.join(",")}`},Ge=(e,t=0,s)=>{const a=de(e.id,s),n=B.indexOf(parseInt(e.influence)),r=Math.round(100/B.length*n);return u`
        <div 
            class=${`person ${a?"active":""}`} 
            style=${`--index: ${t}`}
            data-id=${e.id}>
        
                <button class="expand-button" onclick=${()=>{location.hash=e.id,p()}}>
                    ${x(e.image,e.label)}
                    <img class="loading-icon" src="/loading.svg" />
                </button>

                <a class="name" href=${a?He(s):Je(e.id,s)}>
                    ${e.birth?u`<span class="dates">${e.birth.substr(0,4)} ${e.death?u` / ${e.death.substr(0,4)}`:null}</span>`:null}
                    <span class="text">${e.label}</span>
                    ${r?u`<div class="progress-bar" style=${`--percentage: ${r}`}></div>`:null}
                </a>

                <span class="action-button"></span>
        
        </div>
    `},R=e=>{var a,n;const t=(n=(a=e==null?void 0:e.match(/\d{4}/g))==null?void 0:a.map(r=>parseInt(r)))!=null?n:[],s=Math.min(...t);return s!==1/0?s:null},k=new Map,pe=(e,t)=>(k.has(e)||k.set(e,t))&&k.get(e);var Ke={37:1,38:1,39:1,40:1};const he=e=>t=>{if(!e){t.preventDefault();return}const s=Math.abs(t.touches[0].clientX-t.target._startTouch.x),a=Math.abs(t.touches[0].clientY-t.target._startTouch.y);(e==="y"&&s<a*3||e==="x"&&a<s*3)&&t.cancelable&&t.preventDefault()},fe=he("y"),g=he(null);function me(e){e.target._startTouch={x:e.touches[0].clientX,y:e.touches[0].clientY}}function we(e){if(Ke[e.keyCode])return g(e),!1}var ge=!1;try{window.addEventListener("test",null,Object.defineProperty({},"passive",{get:function(){ge=!0}}))}catch(e){}var f=ge?{passive:!1}:!1,ve="onwheel"in document.createElement("div")?"wheel":"mousewheel";function Ve(e,t){e.addEventListener("DOMMouseScroll",g,!1),e.addEventListener(ve,g,f),e.addEventListener("touchmove",fe,f),e.addEventListener("touchstart",me,f),e.addEventListener("keydown",we,!1)}function Ze(e,t){e.removeEventListener("DOMMouseScroll",g,!1),e.removeEventListener(ve,g,f),e.removeEventListener("touchmove",fe,f),e.removeEventListener("touchstart",me,f),e.removeEventListener("keydown",we,!1)}function ae(e=window){let t=0,s=e===window?window.scrollY:e.scrollTop,a=e===window?window.scrollX:e.scrollLeft;return new Promise(n=>{function r(o){const i=e===window?window.scrollY:e.scrollTop,l=e===window?window.scrollX:e.scrollLeft;o>=500||o-t>20?n(null):((l!=s||i!=a)&&(t=o,s=l,a=i),requestAnimationFrame(r.bind(null,o+1)))}r(0)})}let N=!1;const ze=new Date().getTime(),v=async(e=!1)=>{const t=[...document.querySelectorAll(".column")];if(!t.length)return;const s=[],a=new Date().getTime()-ze;for(const n of t){const r=n.querySelector(".person.active");if(r){const o=r.offsetTop-20,i=n.querySelector(".inner");let l=a<2e3?"auto":"smooth";e&&(l="auto"),i.scrollTo({top:o,behavior:l}),s.push(ae(i).then(()=>{n.classList.remove("is-loading"),Ve(n.querySelector(".inner"))}))}else Ze(n.querySelector(".inner")),n.classList.remove("is-loading")}await Promise.all(s),N||(N=!0,document.body.scrollTo({left:document.body.scrollWidth,behavior:a<2e3?"auto":"smooth"}),ae(document.body).then(()=>{N=!1}))};function et(e,t,s){return s.indexOf(e)===t}const tt=[],st=async e=>{const t=await Ye(e.id);return t.length?u`
    <ul class="ideas item-list">
        <h3>Ideas:</h3>
        ${t.map(s=>u`<li><a class="idea item" href=${`#${s.id}`}>${s.label}</a></li>`)}
    </ul>
    `:null},at=async e=>{const t=await Fe(e.id);for(const s of t)s.cleanedDate=R(s.date);return t.sort((s,a)=>s.cleanedDate-a.cleanedDate),t.length?u`
    <ul class="works item-list">
        <h3>Works:</h3>
        ${t.map(s=>u`<li><a class="work item" href=${`#${s.id}`}>${s.label} ${R(s.date)?u`(${R(s.date)})`:null}</a></li>`)}
    </ul>
    `:null},nt=async e=>{const t=await _e(e.id);return t.length?u`
    <ul class="interests item-list">
        <h3>Interests:</h3>
        ${t.map(s=>u`<li><a class="interest item" href=${`#${s.id}`}>${s.label}</a></li>`)}
    </ul>
    `:null};let m="";const ot=async()=>{let e=localStorage.saved?JSON.parse(localStorage.saved):[];(e.includes(location.pathname)?"bookmarked":"default")==="bookmarked"?(e=e.filter(s=>s!==location.pathname),m="bookmark-removed"):(e.push(location.pathname),m="bookmark-added"),localStorage.saved=JSON.stringify(e),await p(),setTimeout(()=>{m=e.includes(location.pathname)?"bookmarked":"default",p()},1500)},ne=new Map;let B=[];const rt=async(e,t=!1)=>{const s=await Promise.all(e.map(o=>ee(o))),a=pe(location.hash,{popup:null});let n="";if(location.hash){const o=decodeURI(location.hash).substr(1);o==="info"?a.popup={label:"About this app",abstract:`The purple bars show the relative influence compared to all the others currently shown in the app.
                
                Click on the photos of the people to see a popup with more information. Click on the names to expand and see the influence of that person.`}:o&&(a.popup||setTimeout(()=>{ee(o,"en",!0).then(i=>{var d,c;a.popup=i,n=(c=(d=a==null?void 0:a.popup)==null?void 0:d.abstract)!=null?c:"";const l=n.match(/(\.)[^ "]/g);if(l)for(const h of l)n=n.replace(h,`.

`+h.substr(1));a.popup&&(a.popup.abstract=n),p()})},100))}document.body.dataset.selectedPerson=(!!location.hash).toString(),m.includes("-")||(m=(localStorage.saved?JSON.parse(localStorage.saved):[]).includes(location.pathname)?"bookmarked":"default");const r=location.pathname;return ne.has(r)||Promise.all([se(e[0]),Promise.resolve([s[0]]),...e.map(o=>te(o))]).then(o=>{B=o.flatMap(i=>i.map(l=>parseInt(l.influence))).sort((i,l)=>i-l).filter(et),ne.set(r,!0),p()}),u`
        ${location.hash?u`
        <div class="selected-person">
            ${a.popup?u`
            <h1 class="title">${a.popup.label} <button class="close" onclick=${()=>{location.hash="",p()}}></button></h1>
            <div class="abstract">
                ${x(a.popup.image,a.popup.label,300,!0)}
                <p ref=${o=>o.innerText=a.popup.abstract}></p>
                ${a.popup.isPerson==="true"?u`<a href=${`/${a.popup.id}`}>Start with ${a.popup.label}</a>`:null}
                
            </div>

            `:null}
        </div>        
        ${a.popup?null:u`<img class="popup-loading" src="/loading.svg" />`}
        `:null}

        <div class="people">
            ${D(e[0],se,-1,`Influencers of ${s[0].label}`)}
            ${D(e[0],async()=>[s[0]],0,"Your starting selection:")}
            ${e.map((o,i)=>D(o,te,i+1,`Influenced by ${s[i].label}`))}
        </div>

        <div class="fixed-menu">
            <a class="fixed-button info-button" href="#info">
                <div class="icon"></div>
            </a>

            <a class="fixed-button restart-button" href="/">
                <div class="icon"></div>
            </a>

            <button data-state=${m} class="fixed-button bookmark-button" onclick=${ot}>
                <span class="text removed">Bookmark removed</span>
                <span class="text added">Bookmark added</span>
                <div class="icon"></div>
            </button>        
        </div>

    `},X=new Map,it=async(e,t)=>{X.set(e,!0),await p(),t.focus()},j=(e,t=null)=>{X.set(e,!1),P.set(e,""),t&&(t.value=""),p()},P=new Map,lt=q((e,t)=>{P.set(t,e.target.value),p()},100),ct=(e,t)=>{e.target.value||j(t)},D=async(e,t,s,a)=>{var l,d;const n=pe(e+":"+s,{people:[],isLoading:!0});n.isLoading&&t(e).then(c=>{n.people=c,n.isLoading=!1,p().then(v)});const r=n.people.find(c=>de(c.id,s));let o;const i=(l=P.get(s))==null?void 0:l.toLowerCase();return u`
    <div ref=${c=>tt.push(c)} class=${`column is-loading ${s===0?"selected":""} ${r?"active":""}`}>
        <h3 class=${`column-title ${X.get(s)?"active-search":""}`}>
            ${a}
            <input .value=${(d=P.get(s))!=null?d:""} placeholder="Filter" onblur=${c=>ct(c,s)} onkeyup=${c=>lt(c,s)} ref=${c=>o=c} type="search" class="search-field">
            <button onclick=${()=>it(s,o)} class="do-search-icon"></button>
            <button onclick=${()=>j(s,o)} class="close-search-icon"></button>
        </h3>

        <div class="inner">
            ${n.people.filter(c=>i?c.label.toLowerCase().includes(i):!0).map((c,h)=>Ge(c,h,s))}

            <div class="scroll-maker"></div>
        </div>

        ${r?u`
        <div class="item-lists scroll-box">
            ${at(r)}
            ${nt(r)}
            ${st(r)}
        </div>
        `:null}

    </div>
    `};document.body.addEventListener("click",e=>{var s,a;const t=e.target.nodeName!=="A"?e.target.closest("a"):e.target;if(t){const n=t.getAttribute("href");if(n&&n[0]==="/"){e.preventDefault();const r=(s=t.closest(".person"))==null?void 0:s.classList.contains("active"),o=(a=t.closest(".person"))==null?void 0:a.classList.contains("person");o&&!r?(t.closest(".person").classList.add("loading"),setTimeout(v,400)):o&&r&&t.closest(".person").classList.add("is-closing");const i=[...document.querySelectorAll(".column")];if(o&&r){const l=i.indexOf(t.closest(".column"));if(l===1)history.pushState(null,null,n),p();else for(const[d,c]of i.entries())d>l&&(c.addEventListener("animationend",async()=>{history.pushState(null,null,n),await p(),j(d-1),v(),document.body.classList.remove("prepare-removal-column")},{once:!0}),c.classList.add("prepare-removal"),document.body.classList.add("prepare-removal-column"))}else history.pushState(null,null,n),p()}}});"serviceWorker"in navigator&&navigator.serviceWorker.register("./sw.js",{scope:"/"}).then(e=>{console.log("Registration succeeded. Scope is "+e.scope)}).catch(e=>{console.log("Registration failed with "+e)});const ut=q(v,700);let oe="";const dt={columns:()=>{const e=W();return rt(e)},search:()=>Xe()},p=je(async()=>{let e=W();e.some(s=>!E(s))&&(e=await qe(e),history.replaceState(history.state,"",`/${e.join(",")}${location.hash}`));const t=e.length?"columns":"search";try{await K(document.body,dt[t]()),oe!==t&&setTimeout(()=>{v(!0)},700),oe=t}catch(s){s.message==="NetworkError when attempting to fetch resource."?K(document.body,u`<h1 class="offline-message">Unfortunately the data source is unavailable.<br>Please come back later.</h1>`):console.info(s)}},300);p().then(ut);window.addEventListener("popstate",p);
//# sourceMappingURL=index-D4cwRiQz.js.map
