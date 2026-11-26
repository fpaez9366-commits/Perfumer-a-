import {useEffect,useMemo,useState} from 'react';
import {Admin} from './Admin';
import {CATS,Product,Settings,loadAll,money,useCart,wa} from './lib';
import {CartPanel,Detail} from './Extras';

const sel='border border-neutral-300 bg-white px-3 py-3 text-base';
const grid='grid grid-cols-2 gap-x-3 gap-y-10 lg:grid-cols-3 xl:grid-cols-4';

function Card({p,s,open,add}:{p:Product;s:Settings;open:(p:Product)=>void;add:(id:string)=>void}){
  return <article className="group">
    <div onClick={()=>open(p)} className="relative aspect-[3/4] cursor-pointer overflow-hidden bg-neutral-100">
      {p.images[0]?<img src={p.images[0]} alt={p.name} loading="lazy" className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${p.available?'':'opacity-40 grayscale'}`}/>:<div className="grid h-full place-items-center text-sm text-neutral-400">Sin foto</div>}
      {p.images[1]&&p.available&&<img src={p.images[1]} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-100"/>}
      {!p.available&&<span className="absolute left-2 top-2 bg-black px-2 py-1 text-xs text-white">Agotado</span>}
      {p.featured&&p.available&&<span className="absolute left-2 top-2 bg-white px-2 py-1 text-xs">Destacado</span>}
    </div>
    <p className="mt-3 text-sm text-neutral-500">{p.brand} · {p.categories.join(', ')}</p>
    <h3 onClick={()=>open(p)} className="cursor-pointer font-serif text-xl font-semibold leading-tight">{p.name}</h3>
    <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{p.description}</p>
    <p className="mt-2 font-medium">{money(p.price)}</p>
    {p.available&&<button onClick={()=>add(p.id)} className="mt-3 block w-full bg-black py-3 text-sm text-white transition hover:bg-neutral-600">Agregar al carrito</button>}
    {s.whatsapp&&<a href={wa(s,`Hola, estoy interesado en el perfume ${p.name}. ¿Me podrías brindar más información?`)} target="_blank" rel="noreferrer" className="mt-2 block border border-black py-3 text-center text-sm transition hover:bg-neutral-100">Consultar por WhatsApp</a>}
  </article>;
}

function Shop(){
  const[d,setD]=useState<{products:Product[];settings:Settings}|null>(null);
  const[err,setErr]=useState(false),[menu,setMenu]=useState(false);
  const[q,setQ]=useState(''),[cat,setCat]=useState(''),[brand,setBrand]=useState(''),[sort,setSort]=useState('');
  const cart=useCart(),[open,setOpen]=useState<Product|null>(null),[cartOpen,setCartOpen]=useState(false);
  useEffect(()=>{loadAll().then(x=>{setD(x);document.title=x.settings.store_name}).catch(()=>setErr(true))},[]);
  const list=useMemo(()=>(d?.products??[]).filter(p=>(p.name+' '+p.brand).toLowerCase().includes(q.toLowerCase())&&(!cat||p.categories.includes(cat))&&(!brand||p.brand===brand))
    .sort((a,b)=>Number(b.featured)-Number(a.featured)||(sort==='asc'?a.price-b.price:sort==='desc'?b.price-a.price:0)),[d,q,cat,brand,sort]);
  if(err)return <p className="p-10 text-center">No pudimos cargar el catálogo. Revisá tu conexión y recargá la página.</p>;
  if(!d)return <p className="p-10 text-center text-neutral-500">Cargando…</p>;
  const{products:ps,settings:s}=d;
  const brands=[...new Set(ps.map(p=>p.brand))].sort();
  const feat=ps.filter(p=>p.featured&&p.available).slice(0,4),news=ps.slice(0,4);
  const heroImg=(feat[0]??ps.find(p=>p.images[0]))?.images[0];
  const links:[string,string][]=[['Inicio','#inicio'],['Destacados','#destacados'],['Novedades','#novedades'],['Catálogo','#catalogo'],['Contacto','#contacto']];
  const ig=s.instagram.replace('@','');
  return <div id="inicio">
    {open&&<Detail p={open} s={s} onClose={()=>setOpen(null)} onAdd={cart.add}/>}
    {cartOpen&&<CartPanel products={ps} cart={cart.c} setQty={cart.setQty} clear={cart.clear} s={s} onClose={()=>setCartOpen(false)}/>}
    <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <a href="#inicio" className="font-serif text-2xl font-semibold">{s.store_name}</a>
        <nav className="hidden gap-8 text-sm md:flex">{links.map(([t,h])=><a key={h} href={h} className="hover:text-neutral-500">{t}</a>)}</nav>
        <div className="flex items-center gap-1"><button onClick={()=>setCartOpen(true)} className="px-3 py-2 text-sm">Carrito ({Object.values(cart.c).reduce((a,b)=>a+b,0)})</button><button className="p-2 md:hidden" aria-label="Menú" onClick={()=>setMenu(!menu)}>{menu?'✕':'☰'}</button></div>
      </div>
      {menu&&<nav className="flex flex-col border-t border-neutral-200 md:hidden">{links.map(([t,h])=><a key={h} href={h} onClick={()=>setMenu(false)} className="px-4 py-4">{t}</a>)}</nav>}
    </header>
    <section className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 md:grid-cols-2 md:py-20">
      <div>
        <h1 className="font-serif text-5xl font-semibold leading-none md:text-7xl">Descubrí tu próxima fragancia</h1>
        <p className="mt-5 max-w-md text-lg text-neutral-600">Explorá nuestro catálogo y consultá por WhatsApp el perfume que más te guste.</p>
        <a href="#catalogo" className="mt-8 inline-block bg-black px-8 py-4 text-white transition hover:bg-neutral-600">Ver catálogo</a>
      </div>
      <div className="aspect-[4/3] overflow-hidden bg-neutral-100">{heroImg&&<img src={heroImg} alt="" className="h-full w-full object-cover"/>}</div>
    </section>
    {feat.length>0&&<section id="destacados" className="mx-auto max-w-7xl px-4 py-12"><h2 className="mb-6 font-serif text-3xl font-semibold">Productos destacados</h2><div className={grid}>{feat.map(p=><Card key={p.id} p={p} s={s} open={setOpen} add={cart.add}/>)}</div></section>}
    {news.length>0&&<section id="novedades" className="mx-auto max-w-7xl px-4 py-12"><h2 className="mb-6 font-serif text-3xl font-semibold">Novedades</h2><div className={grid}>{news.map(p=><Card key={p.id} p={p} s={s} open={setOpen} add={cart.add}/>)}</div></section>}
    <section id="catalogo" className="mx-auto max-w-7xl px-4 py-12">
      <h2 className="mb-6 font-serif text-3xl font-semibold">Catálogo</h2>
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input className={sel} placeholder="Buscar por nombre o marca" value={q} onChange={e=>setQ(e.target.value)}/>
        <select className={sel} value={cat} onChange={e=>setCat(e.target.value)}><option value="">Todas las categorías</option>{CATS.map(c=><option key={c}>{c}</option>)}</select>
        <select className={sel} value={brand} onChange={e=>setBrand(e.target.value)}><option value="">Todas las marcas</option>{brands.map(b=><option key={b}>{b}</option>)}</select>
        <select className={sel} value={sort} onChange={e=>setSort(e.target.value)}><option value="">Ordenar por precio</option><option value="asc">Menor a mayor</option><option value="desc">Mayor a menor</option></select>
      </div>
      {list.length?<div className={grid}>{list.map(p=><Card key={p.id} p={p} s={s} open={setOpen} add={cart.add}/>)}</div>:<p className="py-16 text-center text-neutral-500">{ps.length?'No encontramos perfumes con esos filtros.':'Pronto vamos a cargar nuestros perfumes.'}</p>}
    </section>
    <footer id="contacto" className="mt-12 bg-black px-4 py-12 text-white"><div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
      <div><p className="font-serif text-2xl">{s.store_name}</p></div>
      <div className="space-y-1 text-sm text-neutral-300">{s.hours&&<p>Horarios: {s.hours}</p>}{s.address&&<p>{s.address}</p>}{s.phone&&<p>Tel: {s.phone}</p>}</div>
      <div className="space-y-1 text-sm">{ig&&<a className="block underline" href={`https://instagram.com/${ig}`} target="_blank" rel="noreferrer">Instagram @{ig}</a>}{s.whatsapp&&<a className="block underline" href={wa(s,'Hola, quiero hacer una consulta.')} target="_blank" rel="noreferrer">WhatsApp</a>}</div>
    </div></footer>
    {s.whatsapp&&<a href={wa(s,'Hola, quiero hacer una consulta.')} target="_blank" rel="noreferrer" className="fixed bottom-4 right-4 z-30 rounded-full bg-black px-5 py-3 text-sm text-white shadow-lg">WhatsApp</a>}
  </div>;
}

export default function App(){
  const[h,setH]=useState(location.hash);
  useEffect(()=>{const f=()=>setH(location.hash);addEventListener('hashchange',f);return()=>removeEventListener('hashchange',f)},[]);
  return h.startsWith('#/admin')?<Admin/>:<Shop/>;
}
