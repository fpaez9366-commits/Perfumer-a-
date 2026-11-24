import {FormEvent,ReactNode,useEffect,useState} from 'react';
import {CATS,Product,Settings,loadAll,money,sb} from './lib';

const inp='w-full border border-neutral-300 px-3 py-3 text-base outline-none focus:border-black';
const btn='bg-black px-4 py-3 text-sm text-white disabled:opacity-50';
const L=({t,children}:{t:string;children:ReactNode})=><label className="block text-sm"><span className="mb-1 block text-neutral-600">{t}</span>{children}</label>;

async function shrink(file:File):Promise<Blob>{
  const b=await createImageBitmap(file),k=Math.min(1,1200/Math.max(b.width,b.height));
  const c=document.createElement('canvas');c.width=Math.round(b.width*k);c.height=Math.round(b.height*k);
  c.getContext('2d')!.drawImage(b,0,0,c.width,c.height);
  return new Promise(r=>c.toBlob(x=>r(x!),'image/jpeg',.82));
}

export function Admin(){
  const[ok,setOk]=useState<boolean|null>(null),[msg,setMsg]=useState('');
  const check=async()=>{
    const{data:{user}}=await sb.auth.getUser();
    if(!user)return setOk(false);
    const{data}=await sb.from('admins').select('user_id').eq('user_id',user.id).maybeSingle();
    if(data)return setOk(true);
    await sb.auth.signOut();setMsg('Esta cuenta no tiene permisos de administrador.');setOk(false);
  };
  useEffect(()=>{check()},[]);
  if(ok===null)return <p className="p-10 text-center">Cargando…</p>;
  return ok?<Panel/>:<Login msg={msg} setMsg={setMsg} onDone={check}/>;
}

function Login({msg,setMsg,onDone}:{msg:string;setMsg:(m:string)=>void;onDone:()=>void}){
  const[e,setE]=useState(''),[p,setP]=useState('');
  const go=async(ev:FormEvent)=>{ev.preventDefault();const{error}=await sb.auth.signInWithPassword({email:e,password:p});error?setMsg('Correo o contraseña incorrectos.'):onDone()};
  return <form onSubmit={go} className="mx-auto mt-20 max-w-sm space-y-4 p-6">
    <h1 className="font-serif text-3xl font-semibold">Panel del propietario</h1>
    <L t="Correo"><input className={inp} type="email" value={e} onChange={x=>setE(x.target.value)} required/></L>
    <L t="Contraseña"><input className={inp} type="password" value={p} onChange={x=>setP(x.target.value)} required/></L>
    {msg&&<p className="text-sm text-red-700">{msg}</p>}
    <button className={btn+' w-full'}>Iniciar sesión</button>
  </form>;
}

function Panel(){
  const[items,setItems]=useState<Product[]>([]),[st,setSt]=useState<Settings|null>(null);
  const[edit,setEdit]=useState<Partial<Product>|null>(null),[tab,setTab]=useState<'p'|'s'>('p'),[msg,setMsg]=useState('');
  const flash=(t:string)=>{setMsg(t);setTimeout(()=>setMsg(''),3000)};
  const reload=()=>loadAll().then(d=>{setItems(d.products);setSt(d.settings)}).catch(()=>flash('Error al cargar datos'));
  useEffect(()=>{reload()},[]);
  const patch=async(p:Product,k:'available'|'featured')=>{const{error}=await sb.from('products').update({[k]:!p[k]}).eq('id',p.id);error?flash('Error: '+error.message):(flash('Guardado ✓'),reload())};
  const del=async(p:Product)=>{if(!confirm(`¿Eliminar ${p.name}?`))return;const{error}=await sb.from('products').delete().eq('id',p.id);error?flash('Error: '+error.message):(flash('Eliminado ✓'),reload())};
  const saveSt=async(ev:FormEvent)=>{ev.preventDefault();const{error}=await sb.from('settings').upsert({...st,id:1});flash(error?'Error: '+error.message:'Guardado ✓')};
  const keys:[keyof Settings,string][]=[['store_name','Nombre de la perfumería'],['whatsapp','WhatsApp con código de país (ej: 5493510000000)'],['instagram','Instagram (usuario)'],['phone','Teléfono'],['address','Ubicación'],['hours','Horarios de atención']];
  return <div className="mx-auto max-w-4xl p-4">
    {msg&&<div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 bg-black px-5 py-3 text-sm text-white shadow-lg">{msg}</div>}
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="font-serif text-3xl font-semibold">Administración</h1>
      <div className="flex gap-2 text-sm"><a href="#inicio" className="border border-neutral-300 px-4 py-3">Ver catálogo</a><button className="border border-neutral-300 px-4 py-3" onClick={async()=>{await sb.auth.signOut();location.reload()}}>Cerrar sesión</button></div>
    </div>
    <div className="mb-6 flex gap-2 text-sm">{([['p','Perfumes'],['s','Datos del local']] as const).map(([k,t])=><button key={k} onClick={()=>setTab(k)} className={`px-4 py-3 ${tab===k?'bg-black text-white':'border border-neutral-300'}`}>{t}</button>)}</div>
    {tab==='s'&&st&&<form onSubmit={saveSt} className="space-y-4">{keys.map(([k,t])=><L key={k} t={t}><input className={inp} value={st[k]??''} onChange={e=>setSt({...st,[k]:e.target.value})}/></L>)}<button className={btn}>Guardar cambios</button></form>}
    {tab==='p'&&(edit?<Form key={edit.id??'new'} p={edit} flash={flash} done={()=>{setEdit(null);reload()}} cancel={()=>setEdit(null)}/>:<>
      <button className={btn+' mb-4'} onClick={()=>setEdit({})}>Agregar perfume</button>
      {!items.length&&<p className="py-10 text-center text-neutral-500">Todavía no cargaste perfumes.</p>}
      <ul className="divide-y divide-neutral-200">{items.map(p=><li key={p.id} className="flex flex-wrap items-center gap-3 py-3">
        <div className="h-16 w-12 shrink-0 bg-neutral-100">{p.images[0]&&<img src={p.images[0]} alt="" className="h-full w-full object-cover"/>}</div>
        <div className="min-w-0 flex-1"><p className="truncate font-medium">{p.name}</p><p className="text-sm text-neutral-500">{p.brand} · {money(p.price)}</p></div>
        <div className="flex flex-wrap gap-2 text-sm">
          <button className="border border-neutral-300 px-3 py-2" onClick={()=>patch(p,'available')}>{p.available?'Disponible':'Agotado'}</button>
          <button className="border border-neutral-300 px-3 py-2" onClick={()=>patch(p,'featured')}>{p.featured?'★ Destacado':'☆ Destacar'}</button>
          <button className="border border-neutral-300 px-3 py-2" onClick={()=>setEdit(p)}>Editar</button>
          <button className="border border-red-300 px-3 py-2 text-red-700" onClick={()=>del(p)}>Eliminar</button>
        </div></li>)}</ul></>)}
  </div>;
}

function Form({p,done,cancel,flash}:{p:Partial<Product>;done:()=>void;cancel:()=>void;flash:(t:string)=>void}){
  const[f,setF]=useState({name:p.name??'',brand:p.brand??'',price:p.price===undefined?'':String(p.price),description:p.description??'',category:p.category??CATS[0],available:p.available??true,featured:p.featured??false,images:p.images??[]});
  const[busy,setBusy]=useState(false);
  const set=(k:string,v:unknown)=>setF(x=>({...x,[k]:v}));
  const up=async(files:FileList|null)=>{
    if(!files)return;setBusy(true);
    try{const urls:string[]=[];
      for(const file of Array.from(files)){const path=`${crypto.randomUUID()}.jpg`;
        const{error}=await sb.storage.from('perfumes').upload(path,await shrink(file),{contentType:'image/jpeg'});if(error)throw error;
        urls.push(sb.storage.from('perfumes').getPublicUrl(path).data.publicUrl)}
      setF(x=>({...x,images:[...x.images,...urls]}));
    }catch(e){flash('Error al subir la foto: '+(e as Error).message)}
    setBusy(false);
  };
  const save=async(ev:FormEvent)=>{
    ev.preventDefault();setBusy(true);
    const row={...f,name:f.name.trim(),brand:f.brand.trim(),price:Number(f.price)};
    const{error}=p.id?await sb.from('products').update(row).eq('id',p.id):await sb.from('products').insert(row);
    setBusy(false);if(error)return flash('Error: '+error.message);flash('Guardado ✓');done();
  };
  return <form onSubmit={save} className="space-y-4">
    <h2 className="font-serif text-2xl font-semibold">{p.id?'Editar perfume':'Agregar perfume'}</h2>
    <L t="Nombre del perfume"><input className={inp} required value={f.name} onChange={e=>set('name',e.target.value)}/></L>
    <L t="Marca"><input className={inp} required value={f.brand} onChange={e=>set('brand',e.target.value)}/></L>
    <L t="Precio (ARS)"><input className={inp} required type="number" min="0" inputMode="decimal" value={f.price} onChange={e=>set('price',e.target.value)}/></L>
    <L t="Descripción"><textarea className={inp} rows={3} value={f.description} onChange={e=>set('description',e.target.value)}/></L>
    <L t="Categoría"><select className={inp} value={f.category} onChange={e=>set('category',e.target.value)}>{CATS.map(c=><option key={c}>{c}</option>)}</select></L>
    <L t="Fotografías (podés elegir varias)"><input className={inp} type="file" accept="image/*" multiple onChange={e=>up(e.target.files)}/></L>
    <div className="flex flex-wrap gap-2">{f.images.map(u=><div key={u} className="relative h-24 w-20 bg-neutral-100"><img src={u} alt="" className="h-full w-full object-cover"/><button type="button" aria-label="Quitar foto" className="absolute right-0 top-0 bg-black px-2 text-white" onClick={()=>set('images',f.images.filter(i=>i!==u))}>✕</button></div>)}</div>
    <label className="flex items-center gap-3"><input type="checkbox" className="h-5 w-5" checked={f.available} onChange={e=>set('available',e.target.checked)}/>Disponible</label>
    <label className="flex items-center gap-3"><input type="checkbox" className="h-5 w-5" checked={f.featured} onChange={e=>set('featured',e.target.checked)}/>Producto destacado</label>
    <div className="flex gap-2"><button className={btn} disabled={busy}>{busy?'Procesando…':'Guardar cambios'}</button><button type="button" className="border border-neutral-300 px-4 py-3 text-sm" onClick={cancel}>Cancelar</button></div>
  </form>;
}
