/// <reference types="vite/client" />
import {createClient} from '@supabase/supabase-js';
export const sb=createClient(import.meta.env.VITE_SUPABASE_URL,import.meta.env.VITE_SUPABASE_ANON_KEY);
export const CATS=['Perfumes para hombre','Perfumes para mujer','Perfumes unisex','Perfumes árabes','Perfumes importados','Nuevos ingresos','Ofertas'];
export type Product={id:string;name:string;brand:string;price:number;description:string;category:string;images:string[];available:boolean;featured:boolean};
export type Settings={store_name:string;whatsapp:string;instagram:string;phone:string;address:string;hours:string};
export const money=(n:number)=>new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(n);
export const wa=(s:Settings,msg:string)=>`https://wa.me/${s.whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`;
export async function loadAll(){
  const[p,s]=await Promise.all([sb.from('products').select('*').order('created_at',{ascending:false}),sb.from('settings').select('*').eq('id',1).single()]);
  if(p.error||s.error)throw new Error('load');
  return{products:p.data as Product[],settings:s.data as Settings};
}
