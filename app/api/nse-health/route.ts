import {setDefaultResultOrder} from "node:dns";
import {FEEDS} from "../../../lib/market";
export const runtime="nodejs";
export async function GET(){
  setDefaultResultOrder("ipv4first");
  const results=await Promise.all(FEEDS.map(async source=>{
    try{
      const response=await fetch(source.url,{cache:"no-store",signal:AbortSignal.timeout(15000),headers:{Accept:"application/rss+xml,application/xml"}});
      if(!response.ok)return {category:source.category,ok:false,status:response.status};
      const xml=await response.text();
      return {category:source.category,ok:xml.includes("<item"),items:(xml.match(/<item(?:\s[^>]*)?>/gi)||[]).length};
    }catch(error){return {category:source.category,ok:false,error:String(error).slice(0,150)}}
  }));
  return Response.json({checkedAt:new Date().toISOString(),results},{headers:{"Cache-Control":"no-store"}});
}
