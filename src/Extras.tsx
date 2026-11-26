import {PointerEvent,useState} from 'react';
import {Product,Settings,money,wa} from './lib';

export function Detail({p,s,onClose,onAdd}:{p:Product;s:Settings;onClose:()=>void;onAdd:(id:string)=>void}){
  const[i,setI]=useState(0),[zoom,setZoom]=useState(false),[o,setO]=useState('50% 50%'),[added,setAdded]=useState(false);
  const move=(e:PointerEvent<HTMLDivElement>)=>{if(!zoom)return;const r=e.currentTarget.getBoundingClientRect();setO(`${(e.clientX-r.left)/r.width*100}% ${(e.clientY-r.top)/r.height*100}%`)};
  const add=()=>{onAdd(p.id);setAdded(true);setTimeout(()=>setAdded(false),1500)};
  return <div className="fixed inset-0 z-40 overflow-y-auto bg-white">
    <button onClick={onClose} className="fixed right-4 top-4 z-50 bg-black px-4 py-3 text-sm text-white">Cerrar ✕</button>
    <div className="mx-auto grid max-w-5xl gap-8 p-4 pt-20 md:grid-cols-2">
      <div>
        <div onPointerMove={move} onClick={()=>setZoom(!zoom)} className={`aspect-[3/4] overflow-hidden bg-neutral-100 ${zoom?'cursor-zoom-out touch-none':'cursor-zoom-in'}`}>
          {p.images[i]&&<img src={p.images[i]} alt={p.name} className="h-full w-full object-contain transition-transform duration-200" style={{transform:zoom?'scale(2.5)':'none',transformOrigin:o}}/>}
        </div>
        <p className="mt-2 text-xs text-neutral-500">{zoom?'Tocá para alejar. Mové el dedo para recorrer la foto.':'Tocá la foto para acercar'}</p>
        {p.images.length>1&&<div className="mt-3 flex gap-2 overflow-x-auto">{p.images.map((u,k)=><img key={u} src={u} alt="" onClick={()=>{setI(k);setZoom(false)}} className={`h-20 w-16 shrink-0 cursor-pointer object-cover ${k===i?'ring-2 ring-black':'opacity-60'}`}/>)}</div>}
      </div>
      <div>
        <p className="text-sm text-neutral-500">{p.brand}</p>
        <h2 className="font-serif text-4xl font-semibold leading-tight">{p.name}</h2>
        <p className="mt-2 text-sm text-neutral-500">{p.categories.join(', ')}</p>
        <p className="mt-4 text-2xl">{money(p.price)}</p>
        <p className="mt-4 whitespace-pre-line text-neutral-700">{p.description}</p>
        {p.available?<button onClick={add} className="mt-6 block w-full bg-black py-4 text-white">{added?'Agregado ✓':'Agregar al carrito'}</button>:<p className="mt-6 bg-neutral-100 py-4 text-center">Agotado</p>}
        {s.whatsapp&&<a href={wa(s,`Hola, estoy interesado en el perfume ${p.name}. ¿Me podrías brindar más información?`)} target="_blank" rel="noreferrer" className="mt-2 block border border-black py-4 text-center">Consultar por WhatsApp</a>}
      </div>
    </div>
  </div>;
}

export function CartPanel({products,cart,setQty,clear,s,onClose}:{products:Product[];cart:Record<string,number>;setQty:(id:string,n:number)=>void;clear:()=>void;s:Settings;onClose:()=>void}){
  const rows=products.filter(p=>cart[p.id]&&p.available);
  const total=rows.reduce((a,p)=>a+p.price*cart[p.id],0);
  const msg=`Hola, quiero hacer este pedido:\n${rows.map(p=>`• ${cart[p.id]} x ${p.name} (${p.brand}) - ${money(p.price*cart[p.id])}`).join('\n')}\nTotal: ${money(total)}`;
  return <div className="fixed inset-0 z-40 flex justify-end bg-black/40" onClick={onClose}>
    <aside onClick={e=>e.stopPropagation()} className="flex h-full w-full max-w-md flex-col bg-white p-4">
      <div className="flex items-center justify-between"><h2 className="font-serif text-2xl font-semibold">Tu carrito</h2><button onClick={onClose} className="px-3 py-2">✕</button></div>
      <div className="mt-4 flex-1 divide-y divide-neutral-200 overflow-y-auto">
        {!rows.length&&<p className="py-10 text-center text-neutral-500">Todavía no agregaste perfumes.</p>}
        {rows.map(p=><div key={p.id} className="flex items-center gap-3 py-3">
          <img src={p.images[0]} alt="" className="h-16 w-12 bg-neutral-100 object-cover"/>
          <div className="min-w-0 flex-1"><p className="truncate font-medium">{p.name}</p><p className="text-sm text-neutral-500">{money(p.price)}</p></div>
          <div className="flex items-center gap-2"><button className="h-9 w-9 border border-neutral-300" onClick={()=>setQty(p.id,cart[p.id]-1)}>−</button><span>{cart[p.id]}</span><button className="h-9 w-9 border border-neutral-300" onClick={()=>setQty(p.id,cart[p.id]+1)}>+</button></div>
        </div>)}
      </div>
      {rows.length>0&&<div className="border-t border-neutral-200 pt-4">
        <p className="mb-3 flex justify-between text-lg"><span>Total</span><span>{money(total)}</span></p>
        {s.whatsapp&&<a href={wa(s,msg)} target="_blank" rel="noreferrer" className="block bg-black py-4 text-center text-white">Enviar pedido por WhatsApp</a>}
        <button onClick={clear} className="mt-2 w-full py-3 text-sm text-neutral-500">Vaciar carrito</button>
      </div>}
    </aside>
  </div>;
}
