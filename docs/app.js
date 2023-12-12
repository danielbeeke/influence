import{html as qe,render as ge}from"https://cdn.skypack.dev/uhtml@3.2.2/async";import{html as k}from"https://cdn.skypack.dev/uhtml@3.2.2/async";function b(e,t,a=!1){var s;return function(){var o=this,n=arguments,r=function(){s=null,a||e.apply(o,n)},l=a&&!s;clearTimeout(s),s=setTimeout(r,t),l&&e.apply(o,n)}}function $e(e){for(var t=0,a=0;a<e.length;a++)t=e.charCodeAt(a)+((t<<5)-t);return t}function ke(e){var t=(e&16777215).toString(16).toUpperCase();return"00000".substring(0,6-t.length)+t}var W=e=>ke($e(e));import{html as _}from"https://cdn.skypack.dev/uhtml@3.2.2/async";import we from"https://cdn.skypack.dev/@jacobmarshall/kv";var Q=(e,t=100,a=!1)=>`https://images.weserv.nl/?url=${encodeURI(e)}&w=${t}${a?"":`&h=${t}&fit=cover&a=attention`}`;var A=we("thumbnailAlternative"),g=async(e,t,a=100,s=!1)=>{var p,d;let o=t==null?void 0:t.replace(/[^A-Z]/g,"").split("").map(i=>i.substr(0,1)),n=await A.get(t);n===void 0&&(n=e);let r=()=>_`<div class="image-alternative" style=${`--color: #${W(t)}`}>
            <span>${o.join("")}</span>
        </div>`;if(n===void 0){let i=`https://en.wikipedia.org/w/api.php?action=query&origin=*&titles=${t}&prop=pageimages&format=json&pithumbsize=${a*3}`,U=await(await fetch(i,{method:"GET"})).json(),[ye]=Object.keys(U.query.pages);n=(d=(p=U.query.pages[ye].thumbnail)==null?void 0:p.source)!=null?d:!1,await A.set(t,n)}let l=async i=>{c(),await A.set(t,!1)};return n===!1?r():_`<img onerror=${[l,{once:!0}]} class="image" src=${Q(n,a,s)} />`};var H=e=>e.split(/\/|#/).pop();var J=e=>{let t=localStorage.saved?JSON.parse(localStorage.saved):[];t=t.filter(a=>a!==e),localStorage.saved=JSON.stringify(t)};var Se=e=>e==="person"?"dbo:influenced|^dbo:influencedBy":"dbo:influencedBy|^dbo:influenced",Ie=(e,t)=>`
    PREFIX dbo: <http://dbpedia.org/ontology/>
    PREFIX dbr: <http://dbpedia.org/resource/>

    SELECT DISTINCT (REPLACE(STR(?person), "http://dbpedia.org/resource/", "") as ?id) ?label ?image ?abstract ?birth ?death (count(DISTINCT ?influenced) as ?influence) ?isPerson
    WHERE {
        <http://dbpedia.org/resource/${e}> rdfs:label ?label .

        BIND (<http://dbpedia.org/resource/${e}> as ?person)
   

        OPTIONAL { <http://dbpedia.org/resource/${e}> dbo:abstract  ?abstract }

        OPTIONAL {?person dbo:activeYearsStartYear ?activeYearsStartYear}
        OPTIONAL {?person dbp:activeYearsStartYear ?activeYearsStartYearProperty}

        OPTIONAL {?person dbo:birthYear ?birthYear}
        OPTIONAL {?person dbo:deathYear ?deathYear}

        OPTIONAL {?person dbo:birthDate ?birthDate}
        OPTIONAL {?person dbo:deathDate ?deathDate}

        BIND (COALESCE(?deathDate, ?deathYear) as ?death)
        BIND (COALESCE(?birthDate, ?birthYear, ?activeYearsStartYear, ?activeYearsStartYearProperty) as ?birth)

        OPTIONAL { ?person dbo:influenced|^dbo:influencedBy ?influenced }

        OPTIONAL {<http://dbpedia.org/resource/${e}> dbo:image ?image }
        FILTER (lang(?label) = '${t}')
        FILTER (lang(?abstract) = '${t}')
        BIND(EXISTS{?person a schema:Person} AS ?isPerson)
    }
`,K=(e,t,a)=>`
    PREFIX dbo: <http://dbpedia.org/ontology/>
    PREFIX dbr: <http://dbpedia.org/resource/>

    SELECT DISTINCT ?abstract ?label ?image (REPLACE(STR(?item), "http://dbpedia.org/resource/", "") as ?id)
    WHERE {
        <http://dbpedia.org/resource/${e}> ${a} ?item .
        ?item dbo:abstract ?abstract .
        ?item rdfs:label ?label .

        OPTIONAL {?item dbo:image ?image}
        FILTER (lang(?label) = '${t}')
        FILTER (lang(?abstract) = '${t}')
    }
    ORDER BY ASC(?date)
`,Te=(e,t)=>K(e,t,"dbo:mainInterest"),Ee=(e,t)=>K(e,t,"dbo:notableIdea"),Le=(e,t)=>`
    PREFIX dbo: <http://dbpedia.org/ontology/>
    PREFIX dbr: <http://dbpedia.org/resource/>

    SELECT DISTINCT ?abstract ?label ?pages ?date ?image (REPLACE(STR(?work), "http://dbpedia.org/resource/", "") as ?id)
    WHERE {
        ?work dbo:author <http://dbpedia.org/resource/${e}> .
        ?work dbo:abstract ?abstract .
        ?work dbp:name ?label .
       
        OPTIONAL {?work dbo:releaseDate ?releaseDate}
        OPTIONAL {?work dbp:releaseDate ?releaseDateProperty}
        BIND (COALESCE(?releaseDate, ?releaseDateProperty) as ?date)

        OPTIONAL {?work dbo:image ?image}
        FILTER (lang(?label) = '${t}')
        FILTER (lang(?abstract) = '${t}')
    }
    ORDER BY ASC(?date)
`,Pe=e=>`
SELECT ?uri ?label ?image  (count(?influenced) as ?influence) { 
    ?uri rdfs:label ?label .
    ?uri a schema:Person .
    ?label bif:contains '"${e}"' .
    OPTIONAL { ?uri dbo:image ?image }
    filter langMatches(lang(?label), "en")
    OPTIONAL { ?uri dbo:influenced|^dbo:influencedBy ?influenced }
}
ORDER BY DESC(?influence) 
LIMIT 20        
`,G=(e,t,a)=>`
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX dbo: <http://dbpedia.org/ontology/>
    PREFIX dbp: <http://dbpedia.org/property/>
    PREFIX dbr: <http://dbpedia.org/resource/>

    SELECT DISTINCT (REPLACE(STR(?person), "http://dbpedia.org/resource/", "") as ?id) ?label ?image ?birth ?death (count(DISTINCT ?influenced) as ?influence)
    WHERE {
        ?person rdfs:label ?label .
        { SELECT DISTINCT ?person { <http://dbpedia.org/resource/${e}> ${Se(t)} ?person . }}

        OPTIONAL {?person dbo:activeYearsStartYear ?activeYearsStartYear}
        OPTIONAL {?person dbp:activeYearsStartYear ?activeYearsStartYearProperty}

        OPTIONAL {?person dbo:image ?image }

        OPTIONAL {?person dbo:birthYear ?birthYear}
        OPTIONAL {?person dbo:deathYear ?deathYear}

        OPTIONAL {?person dbo:birthDate ?birthDate}
        OPTIONAL {?person dbo:deathDate ?deathDate}

        BIND (COALESCE(?deathDate, ?deathYear) as ?death)
        BIND (COALESCE(?birthDate, ?birthYear, ?activeYearsStartYear, ?activeYearsStartYearProperty) as ?birth)

        ?person dbo:influenced|^dbo:influencedBy ?influenced .

        FILTER isIRI(?person) 
        FILTER exists { ?person a schema:Person }
        FILTER exists { ?influenced a schema:Person }

        FILTER (lang(?label) = '${a}')
    }
    ORDER BY DESC(?influence)

    LIMIT 1000
`,Z=new Map,m=async e=>{let t=Z.get(e);if(!t){let a=e.replace(/\n/g," ");return fetch(`https://dbpedia.org/sparql?default-graph-uri=http://dbpedia.org&query=${encodeURI(a)}&format=application/json-ld`).then(o=>o.json()).then(o=>(Z.set(e,o),o))}return t},f=(e,t=!1)=>{let a=e.head.vars,s=e.results.bindings.map(o=>{var r;let n={};for(let l of a)n[l]=(r=o[l])==null?void 0:r.value;return n});return t?s[0]:s},R=async(e,t="en")=>{let a=await m(Ie(e,t));return f(a,!0)},C=async(e,t="en")=>{let a=await m(G(e,"person",t));return f(a)},N=async(e,t="en")=>{let a=await m(G(e,"others",t));return f(a)},z=async(e,t="en")=>{let a=await m(Le(e,t));return f(a)},V=async(e,t="en")=>{let a=await m(Te(e,t));return f(a)},ee=async(e,t="en")=>{let a=await m(Ee(e,t));return f(a)},te=async e=>{let t=await m(Pe(e));return f(t)};var Oe=async e=>{if(e.target.value.length<4)return;Y=!0,c();let t=await te(e.target.value);console.log(t),ae(t.map(a=>({label:a.label,image:a.image,id:H(a.uri)}))),Y=!1,c()},x=[],ae=e=>{x=e},Y=!1,se=()=>{let e=localStorage.saved?JSON.parse(localStorage.saved):[];return k`


        <form class=${`search-form ${Y?"is-searching":""}`} onsubmit=${t=>t.preventDefault()}>
        <header class="site-header">
            <img class="site-logo" src="/logo.svg" />
            <h1 class="site-title">Influence</h1>
        </header>

        <h3 class="title">Search for a philosopher or an influential thinker</h3>
            <div class="search-field-wrapper">
            <img class="search-icon" src="/zoom.svg" />
            <input onkeyup=${b(Oe,500)} type="search" class="search-input">
            <img class="search-loading-icon" src="/loading.svg" />
            </div>

            ${x.map(t=>k`
                <a class="suggestion" href=${`/${t.id}`} onclick=${()=>ae([])}>
                    ${g(t.image,t.label)}
                    <h3 class="title">${t.label}</h3>
                </div>
            `)}

            ${x.length?null:k`
            <div class="hint">
            You can try <a href="/Søren_Kierkegaard">Søren Kierkegaard</a> or <a href="/Plato">Plato</a>
            </div>
            `}

            ${e.length?k`
                <div class="saved-bookmarks">
                    <h3 class="title"><img src="/bookmarks.svg"> Your bookmarks</h3>

                    <ul class="bookmark-list">
                    ${e.map(t=>{let a=t.substr(1).split(",").map(o=>decodeURI(o).replace(/_/g," ")),s=`${a[0]} > ${a[a.length-1]} (${a.length})`;return k`
                        <li>
                            <a class="bookmark" href=${t}>${s}</a>
                            <img class="remove-bookmark" onclick=${()=>{J(t),c()}} src="/delete.svg" />
                        </li>
                        `})}

                    </ul>
                </div>
            `:null}

        </form>
    `};function oe(e,t,a={leading:!0,trailing:!0}){var s,o,n,r=null,l=0,p=function(){l=a.leading===!1?0:Date.now(),r=null,n=e.apply(s,o),r||(s=o=null)};return function(){var d=Date.now();!l&&a.leading===!1&&(l=d);var i=t-(d-l);return s=this,o=arguments,i<=0||i>t?(r&&(clearTimeout(r),r=null),l=d,n=e.apply(s,o),r||(s=o=null)):!r&&a.trailing!==!1&&(r=setTimeout(p,i)),n}}var w=()=>decodeURI(location.pathname).substr(1).split(",").filter(Boolean);import{html as u}from"https://cdn.skypack.dev/uhtml@3.2.2/async";var I=(e,t)=>w()[t]===e;import{html as T}from"https://cdn.skypack.dev/uhtml@3.2.2/async";var De=e=>{let t=location.pathname.substr(1).split(",");return t.splice(e),`/${t.join(",")}`},Ae=(e,t)=>{let a=location.pathname.substr(1).split(",");return t<0?a=[e]:(a.splice(t),a[t]=e),`/${a.join(",")}`},re=(e,t=0,a)=>{let s=I(e.id,a),o=E.indexOf(parseInt(e.influence)),n=Math.round(100/E.length*o);return T`
        <div 
            class=${`person ${s?"active":""}`} 
            style=${`--index: ${t}`}
            data-id=${e.id}>
        
                <button class="expand-button" onclick=${()=>{location.hash=e.id,c()}}>
                    ${g(e.image,e.label)}
                    <img class="loading-icon" src="/loading.svg" />
                </button>

                <a class="name" href=${s?De(a):Ae(e.id,a)}>
                    ${e.birth?T`<span class="dates">${e.birth.substr(0,4)} ${e.death?T` / ${e.death.substr(0,4)}`:null}</span>`:null}
                    <span class="text">${e.label}</span>
                    ${n?T`<div class="progress-bar" style=${`--percentage: ${n}`}></div>`:null}
                </a>

                <span class="action-button"></span>
        
        </div>
    `};var L=e=>{var s,o;let t=(o=(s=e==null?void 0:e.match(/\d{4}/g))==null?void 0:s.map(n=>parseInt(n)))!=null?o:[],a=Math.min(...t);return a!==Infinity?a:null};var P=new Map,j=(e,t)=>(P.has(e)||P.set(e,t))&&P.get(e);var Re={37:1,38:1,39:1,40:1},B=e=>t=>{if(!e){t.preventDefault();return}let a=Math.abs(t.touches[0].clientX-t.target._startTouch.x),s=Math.abs(t.touches[0].clientY-t.target._startTouch.y);(e==="y"&&a<s*3||e==="x"&&s<a*3)&&t.cancelable&&t.preventDefault()},ne=B("x"),le=B("y"),S=B(null);function ie(e){e.target._startTouch={x:e.touches[0].clientX,y:e.touches[0].clientY}}function ce(e){if(Re[e.keyCode])return S(e),!1}var pe=!1;try{window.addEventListener("test",null,Object.defineProperty({},"passive",{get:function(){pe=!0}}))}catch(e){}var v=pe?{passive:!1}:!1,de="onwheel"in document.createElement("div")?"wheel":"mousewheel";function ue(e,t){e.addEventListener("DOMMouseScroll",S,!1),e.addEventListener(de,S,v),e.addEventListener("touchmove",t==="x"?ne:le,v),e.addEventListener("touchstart",ie,v),e.addEventListener("keydown",ce,!1)}function he(e,t){e.removeEventListener("DOMMouseScroll",S,!1),e.removeEventListener(de,S,v),e.removeEventListener("touchmove",t==="x"?ne:le,v),e.removeEventListener("touchstart",ie,v),e.removeEventListener("keydown",ce,!1)}function F(e=window){let t=0,a=e===window?window.scrollY:e.scrollTop,s=e===window?window.scrollX:e.scrollLeft;return new Promise(o=>{function n(r){let l=e===window?window.scrollY:e.scrollTop,p=e===window?window.scrollX:e.scrollLeft;r>=500||r-t>20?o(null):((p!=a||l!=s)&&(t=r,a=p,s=l),requestAnimationFrame(n.bind(null,r+1)))}n(0)})}var M=!1,Ce=new Date().getTime(),h=async(e=!1)=>{let t=[...document.querySelectorAll(".column")];if(!t.length)return;let a=[],s=new Date().getTime()-Ce;for(let o of t){let n=o.querySelector(".person.active");if(n){let r=n.offsetTop-20,l=o.querySelector(".inner"),p=s<2e3?"auto":"smooth";e&&(p="auto"),l.scrollTo({top:r,behavior:p}),a.push(F(l).then(()=>{o.classList.remove("is-loading"),ue(o.querySelector(".inner"),"y")}))}else he(o.querySelector(".inner"),"y"),o.classList.remove("is-loading")}await Promise.all(a),M||(M=!0,document.body.scrollTo({left:document.body.scrollWidth,behavior:s<2e3?"auto":"smooth"}),F(document.body).then(()=>{M=!1}))};function me(e,t,a){return a.indexOf(e)===t}var Ne=[],Ye=async e=>{let t=await ee(e.id);return t.length?u`
    <ul class="ideas item-list">
        <h3>Ideas:</h3>
        ${t.map(a=>u`<li><a class="idea item" href=${`#${a.id}`}>${a.label}</a></li>`)}
    </ul>
    `:null},xe=async e=>{let t=await z(e.id);for(let a of t)a.cleanedDate=L(a.date);return t.sort((a,s)=>a.cleanedDate-s.cleanedDate),t.length?u`
    <ul class="works item-list">
        <h3>Works:</h3>
        ${t.map(a=>u`<li><a class="work item" href=${`#${a.id}`}>${a.label} ${L(a.date)?u`(${L(a.date)})`:null}</a></li>`)}
    </ul>
    `:null},je=async e=>{let t=await V(e.id);return t.length?u`
    <ul class="interests item-list">
        <h3>Interests:</h3>
        ${t.map(a=>u`<li><a class="interest item" href=${`#${a.id}`}>${a.label}</a></li>`)}
    </ul>
    `:null},y="",Be=async()=>{let e=localStorage.saved?JSON.parse(localStorage.saved):[];(e.includes(location.pathname)?"bookmarked":"default")==="bookmarked"?(e=e.filter(a=>a!==location.pathname),y="bookmark-removed"):(e.push(location.pathname),y="bookmark-added"),localStorage.saved=JSON.stringify(e),await c(),setTimeout(()=>{y=e.includes(location.pathname)?"bookmarked":"default",c()},1500)},fe=new Map,E=[],be=async(e,t=!1)=>{let a=await Promise.all(e.map(r=>R(r))),s=j(location.hash,{popup:null}),o="";if(location.hash){let r=decodeURI(location.hash).substr(1);r==="info"?s.popup={label:"About this app",abstract:`The purple bars show the relative influence compared to all the others currently shown in the app.
                
                Click on the photos of the people to see a popup with more information. Click on the names to expand and see the influence of that person.`}:r&&(s.popup||setTimeout(()=>{R(r,"en").then(l=>{var d,i;s.popup=l,o=(i=(d=s==null?void 0:s.popup)==null?void 0:d.abstract)!=null?i:"";let p=o.match(/(\.)[^ "]/g);if(p)for(let $ of p)o=o.replace($,`.

`+$.substr(1));s.popup&&(s.popup.abstract=o),c()})},100))}document.body.dataset.selectedPerson=(!!location.hash).toString(),y.includes("-")||(y=(localStorage.saved?JSON.parse(localStorage.saved):[]).includes(location.pathname)?"bookmarked":"default");let n=location.pathname;return fe.has(n)||Promise.all([N(e[0]),Promise.resolve([a[0]]),...e.map(r=>C(r))]).then(r=>{E=r.flatMap(l=>l.map(p=>parseInt(p.influence))).sort((l,p)=>l-p).filter(me),fe.set(n,!0),c()}),u`
        ${location.hash?u`
        <div class="selected-person">
            ${s.popup?u`
            <h1 class="title">${s.popup.label} <button class="close" onclick=${()=>{location.hash="",c()}}></button></h1>
            <div class="abstract">
                ${g(s.popup.image,s.popup.label,300,!0)}
                <p ref=${r=>r.innerText=s.popup.abstract}></p>
                ${parseInt(s.popup.isPerson)?u`<a href=${`/${s.popup.id}`}>Start with ${s.popup.label}</a>`:null}
                
            </div>

            `:null}
        </div>        
        ${s.popup?null:u`<img class="popup-loading" src="/loading.svg" />`}
        `:null}

        <div class="people">
            ${X(e[0],N,-1,`Influencers of ${a[0].label}`)}
            ${X(e[0],async()=>[a[0]],0,"Your starting selection:")}
            ${e.map((r,l)=>X(r,C,l+1,`Influenced by ${a[l].label}`))}
        </div>

        <div class="fixed-menu">
            <a class="fixed-button info-button" href="#info">
                <div class="icon"></div>
            </a>

            <a class="fixed-button restart-button" href="/">
                <div class="icon"></div>
            </a>

            <button data-state=${y} class="fixed-button bookmark-button" onclick=${Be}>
                <span class="text removed">Bookmark removed</span>
                <span class="text added">Bookmark added</span>
                <div class="icon"></div>
            </button>        
        </div>

    `},q=new Map,Fe=async(e,t)=>{q.set(e,!0),await c(),t.focus()},D=(e,t=null)=>{q.set(e,!1),O.set(e,""),t&&(t.value=""),c()},O=new Map,Me=b((e,t)=>{O.set(t,e.target.value),c()},100),Xe=(e,t)=>{e.target.value||D(t)},X=async(e,t,a,s)=>{var p,d;let o=j(e+":"+a,{people:[],isLoading:!0});o.isLoading&&t(e).then(i=>{o.people=i,o.isLoading=!1,c().then(h)});let n=o.people.find(i=>I(i.id,a)),r,l=(p=O.get(a))==null?void 0:p.toLowerCase();return u`
    <div ref=${i=>Ne.push(i)} class=${`column is-loading ${a===0?"selected":""} ${n?"active":""}`}>
        <h3 class=${`column-title ${q.get(a)?"active-search":""}`}>
            ${s}
            <input .value=${(d=O.get(a))!=null?d:""} placeholder="Filter" onblur=${i=>Xe(i,a)} onkeyup=${i=>Me(i,a)} ref=${i=>r=i} type="search" class="search-field">
            <button onclick=${()=>Fe(a,r)} class="do-search-icon"></button>
            <button onclick=${()=>D(a,r)} class="close-search-icon"></button>
        </h3>

        <div class="inner">
            ${o.people.filter(i=>l?i.label.toLowerCase().includes(l):!0).map((i,$)=>re(i,$,a))}

            <div class="scroll-maker"></div>
        </div>

        ${n?u`
        <div class="item-lists scroll-box">
            ${xe(n)}
            ${je(n)}
            ${Ye(n)}
        </div>
        `:null}

    </div>
    `};document.body.addEventListener("click",e=>{var a,s;let t=e.target.nodeName!=="A"?e.target.closest("a"):e.target;if(t){let o=t.getAttribute("href");if(o&&o[0]==="/"){e.preventDefault();let n=(a=t.closest(".person"))==null?void 0:a.classList.contains("active"),r=(s=t.closest(".person"))==null?void 0:s.classList.contains("person");r&&!n?(t.closest(".person").classList.add("loading"),setTimeout(h,400)):r&&n&&t.closest(".person").classList.add("is-closing");let l=[...document.querySelectorAll(".column")];if(r&&n){let p=l.indexOf(t.closest(".column"));if(p===1)history.pushState(null,null,o),c();else for(let[d,i]of l.entries())d>p&&(i.addEventListener("animationend",async()=>{history.pushState(null,null,o),await c(),D(d-1),h(),document.body.classList.remove("prepare-removal-column")},{once:!0}),i.classList.add("prepare-removal"),document.body.classList.add("prepare-removal-column"))}else history.pushState(null,null,o),c()}}});"serviceWorker"in navigator&&navigator.serviceWorker.register("./sw.js",{scope:"/"}).then(e=>{console.log("Registration succeeded. Scope is "+e.scope)}).catch(e=>{console.log("Registration failed with "+e)});var Ue=b(h,700),ve="",We={columns:()=>{let e=w();return be(e)},search:()=>se()},c=oe(async()=>{let t=w().length?"columns":"search";try{await ge(document.body,We[t]()),ve!==t&&setTimeout(()=>{h(!0)},700),ve=t}catch(a){a.message==="NetworkError when attempting to fetch resource."?ge(document.body,qe`<h1 class="dbpedia-offline">Unfortunatly DBpedia is down.<br>Please come back later.</h1>`):console.info(a)}},300);c().then(Ue);window.addEventListener("popstate",c);export{c as drawApp};
//# sourceMappingURL=app.js.map
